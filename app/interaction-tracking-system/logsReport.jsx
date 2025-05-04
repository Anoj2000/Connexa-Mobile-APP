import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { collection, query, orderBy, where, onSnapshot } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const LogsReportScreen = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Create month and year options
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 5}, (_, i) => currentYear - i);

  // Fetch logs for the selected month and year
  useEffect(() => {
    setLoading(true);
    
    // Create date range for filtering
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0);
    
    // Set time to get full day coverage
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    const logsRef = collection(FIREBASE_DB, "logs");
    const q = query(
      logsRef, 
      where("createdAt", ">=", startDate),
      where("createdAt", "<=", endDate),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        displayDate: formatDate(doc.data().createdAt?.toDate()),
        displayTime: formatTimeFromDate(doc.data().createdAt?.toDate()),
        interactionType: doc.data().interactionType || 'Message'
      }));
      
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      Alert.alert("Error", "Failed to load logs");
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [selectedMonth, selectedYear]);

  // Format date and time
  const formatDate = (date) => {
    if (!date) return 'No date';
    return date.toLocaleDateString();
  };
  
  const formatTimeFromDate = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Generate PDF HTML content
  const generatePdfContent = () => {
    // Table rows HTML
    const tableRows = logs.map(log => `
      <tr>
        <td>${log.contactName || 'No Name'}</td>
        <td>${log.interactionType || 'Message'}</td>
        <td>${log.displayDate}</td>
        <td>${log.displayTime}</td>
        <td>${log.note || 'No notes'}</td>
      </tr>
    `).join('');
    
    // Full HTML content with styling
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Interaction Logs Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #2979FF;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 16px;
              color: #666;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              background-color: #2979FF;
              color: white;
              padding: 10px;
              text-align: left;
            }
            td {
              border: 1px solid #ddd;
              padding: 8px;
              font-size: 14px;
            }
            tr:nth-child(even) {
              background-color: #f2f2f2;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #999;
            }
            .no-data {
              text-align: center;
              color: #999;
              padding: 30px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Interaction Logs Report</div>
            <div class="subtitle">${months[selectedMonth]} ${selectedYear}</div>
          </div>
          
          ${logs.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Contact Name</th>
                  <th>Interaction Type</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          ` : `
            <div class="no-data">
              No interaction logs found for ${months[selectedMonth]} ${selectedYear}
            </div>
          `}
          
          <div class="footer">
            Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
          </div>
        </body>
      </html>
    `;
  };

  // Generate and download PDF
  const generateAndDownloadPdf = async () => {
    try {
      setGeneratingPdf(true);
      
      // Generate HTML content
      const htmlContent = generatePdfContent();
      
      // Create PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      
      // File name for the PDF
      const fileName = `Interaction_Logs_${months[selectedMonth]}_${selectedYear}.pdf`;
      
      // Create a new file path with proper name
      const newFileUri = FileSystem.documentDirectory + fileName;
      
      // Copy the file to the new location with proper name
      await FileSystem.copyAsync({
        from: uri,
        to: newFileUri
      });
      
      // Share the file
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(newFileUri);
      } else {
        // For Android, we directly share
        await Sharing.shareAsync(newFileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Download Interaction Logs Report',
          UTI: 'com.adobe.pdf'
        });
      }
      
      setGeneratingPdf(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF report');
      setGeneratingPdf(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Select Period</Text>
          
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Month:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedMonth}
                onValueChange={(value) => setSelectedMonth(value)}
                style={styles.picker}
              >
                {months.map((month, index) => (
                  <Picker.Item key={month} label={month} value={index} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Year:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedYear}
                onValueChange={(value) => setSelectedYear(value)}
                style={styles.picker}
              >
                {years.map((year) => (
                  <Picker.Item key={year} label={year.toString()} value={year} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2979FF" />
            <Text style={styles.loadingText}>Loading logs...</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>
                {months[selectedMonth]} {selectedYear} Summary
              </Text>
              <Text style={styles.summaryInfo}>
                Total Interactions: <Text style={styles.summaryValue}>{logs.length}</Text>
              </Text>
              
              <View style={styles.typeSummary}>
                <Text style={styles.typeSummaryTitle}>Interaction Types:</Text>
                {Object.entries(
                  logs.reduce((acc, log) => {
                    const type = log.interactionType || 'Message';
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([type, count]) => (
                  <Text key={type} style={styles.typeSummaryItem}>
                    {type}: <Text style={styles.typeSummaryValue}>{count}</Text>
                  </Text>
                ))}
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.downloadButton}
              onPress={generateAndDownloadPdf}
              disabled={generatingPdf || logs.length === 0}
            >
              {generatingPdf ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={22} color="white" style={styles.downloadIcon} />
                  <Text style={styles.downloadButtonText}>
                    {logs.length === 0 ? 'No Data to Download' : 'Download PDF Report'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            {logs.length === 0 && !loading && (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>
                  No interaction logs found for {months[selectedMonth]} {selectedYear}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  filterSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 15,
    color: '#333',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickerLabel: {
    width: 70,
    fontSize: 16,
    color: '#555',
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
  },
  summaryInfo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  summaryValue: {
    fontWeight: '600',
    color: '#2979FF',
  },
  typeSummary: {
    marginTop: 10,
  },
  typeSummaryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    marginBottom: 5,
  },
  typeSummaryItem: {
    fontSize: 15,
    color: '#666',
    marginLeft: 10,
    marginBottom: 3,
  },
  typeSummaryValue: {
    fontWeight: '600',
    color: '#2979FF',
  },
  downloadButton: {
    backgroundColor: '#2979FF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadIcon: {
    marginRight: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    fontSize: 16,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default LogsReportScreen;
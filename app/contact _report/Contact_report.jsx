// app/contact_report/Contact_report.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';
import { FIREBASE_DB } from '../../firebaseConfig';

const ContactReport = () => {
  const [weeklyData, setWeeklyData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [totalContacts, setTotalContacts] = useState(0);

  useEffect(() => {
    const fetchWeeklyContacts = async () => {
      try {
        const db = getFirestore();
        const contactsRef = collection(db, 'contacts');
        
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        startOfWeek.setHours(0, 0, 0, 0);
        
        const daysOfWeek = [];
        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          daysOfWeek.push(day);
        }
        
        const weeklyCounts = await Promise.all(
          daysOfWeek.map(async (day) => {
            const nextDay = new Date(day);
            nextDay.setDate(day.getDate() + 1);
            
            const q = query(
              contactsRef,
              where('createdAt', '>=', day),
              where('createdAt', '<', nextDay)
            );
            
            const querySnapshot = await getDocs(q);
            return querySnapshot.size;
          })
        );
        
        const total = weeklyCounts.reduce((sum, count) => sum + count, 0);
        setTotalContacts(total);
        
        setWeeklyData({
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{ data: weeklyCounts }],
        });
      } catch (error) {
        console.error('Error fetching weekly contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWeeklyContacts();
  }, []);

  const generatePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      const currentDate = new Date().toLocaleDateString();
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial; padding: 20px; }
              h1 { color: #2979FF; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background-color: #2979FF; color: white; padding: 8px; text-align: left; }
              td { padding: 8px; border-bottom: 1px solid #ddd; }
              .total { font-weight: bold; color: #2979FF; }
            </style>
          </head>
          <body>
            <h1>Weekly Contacts Report</h1>
            <p>Generated on: ${currentDate}</p>
            <table>
              <tr>
                <th>Day</th>
                <th>Contacts Added</th>
              </tr>
              ${weeklyData.labels.map((day, index) => `
                <tr>
                  <td>${day}</td>
                  <td>${weeklyData.datasets[0].data[index] || 0}</td>
                </tr>
              `).join('')}
              <tr>
                <td class="total">Total</td>
                <td class="total">${totalContacts}</td>
              </tr>
            </table>
          </body>
        </html>
      `;
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        width: 612,
        height: 792,
        base64: false
      });
      
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Weekly Contacts Report',
        UTI: 'com.adobe.pdf',
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator size="large" color="#2979FF" />
        <Text style={styles.loadingText}>Loading contact data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Weekly Contacts Added</Text>
      
      {weeklyData.labels && weeklyData.labels.length > 0 ? (
        <>
          <BarChart
            data={weeklyData}
            width={Dimensions.get('window').width - 40}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(41, 121, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#2979FF',
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
          
          <Text style={styles.summaryText}>Total contacts this week: {totalContacts}</Text>
          
          <TouchableOpacity 
            style={styles.downloadButton} 
            onPress={generatePDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.downloadButtonText}>Download PDF Report</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.placeholder}>
          <Text>No contact data available for this week</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginLeft: 5,
  },
  placeholder: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 10,
    textAlign: 'center',
  },
  downloadButton: {
    backgroundColor: '#2979FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  downloadButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ContactReport;
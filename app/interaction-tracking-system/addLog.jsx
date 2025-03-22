import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView
} from 'react-native';

const NewLogScreen = () => {
  const [contactName, setContactName] = useState('');
  const [selectedInteraction, setSelectedInteraction] = useState('');
  const [noteText, setNoteText] = useState('');
  const [showInteractionOptions, setShowInteractionOptions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Interaction types
  const interactionTypes = ['Message', 'Emails', 'Meetings'];
  
  // Date options
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = [...Array(31)].map((_, i) => (i + 1).toString());
  const years = ['2021', '2022', '2023', '2024', '2025'];
  
  // Default date (current month and next days)
  const [dateSelection, setDateSelection] = useState({
    month: 'September',
    day: '17',
    year: '2023'
  });
  
  const handleDateSelect = (type, value) => {
    setDateSelection(prev => ({
      ...prev,
      [type]: value
    }));
  };
  
  const renderDateSelector = () => {
    return (
      <TouchableOpacity 
        style={styles.dateContainer}
        onPress={() => setShowDatePicker(true)}
      >
        <View style={styles.dateRow}>
          <Text style={[styles.dateText, styles.dateTextInactive]}>August</Text>
          <Text style={[styles.dateNumber, styles.dateTextInactive]}>16</Text>
          <Text style={[styles.dateText, styles.dateTextInactive]}>2021</Text>
        </View>
        
        <View style={[styles.dateRow, styles.selectedDateRow]}>
          <Text style={styles.dateText}>{dateSelection.month}</Text>
          <Text style={styles.dateNumber}>{dateSelection.day}</Text>
          <Text style={styles.dateText}>{dateSelection.year}</Text>
        </View>
        
        <View style={styles.dateRow}>
          <Text style={[styles.dateText, styles.dateTextInactive]}>October</Text>
          <Text style={[styles.dateNumber, styles.dateTextInactive]}>18</Text>
          <Text style={[styles.dateText, styles.dateTextInactive]}>2023</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderInteractionSelector = () => {
    return (
      <TouchableOpacity 
        style={styles.dropdownSelector}
        onPress={() => setShowInteractionOptions(true)}
      >
        <Text style={selectedInteraction ? styles.selectedText : styles.placeholderText}>
          {selectedInteraction || 'Choose Type'}
        </Text>
        <Text style={styles.dropdownArrow}>∨</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Log</Text>
          <TouchableOpacity>
            <Text style={styles.addButton}>Add</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Contact Name"
              value={contactName}
              onChangeText={setContactName}
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Select interaction</Text>
            {renderInteractionSelector()}
          </View>
          
          {renderDateSelector()}
          
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Note and summary"
              value={noteText}
              onChangeText={setNoteText}
              placeholderTextColor="#999"
              multiline
            />
          </View>
          
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
        
        {/* Interaction Selection Modal */}
        <Modal
          visible={showInteractionOptions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowInteractionOptions(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowInteractionOptions(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.interactionOptions}>
                {interactionTypes.map((type, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={[
                      styles.interactionOption,
                      selectedInteraction === type && styles.selectedInteraction,
                      index === interactionTypes.length - 1 && styles.lastOption
                    ]}
                    onPress={() => {
                      setSelectedInteraction(type);
                      setShowInteractionOptions(false);
                    }}
                  >
                    <Text 
                      style={[
                        styles.interactionText,
                        selectedInteraction === type && styles.selectedInteractionText
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
        
        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          >
            <View style={styles.datePicker}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.dateSelectors}>
                <View style={styles.dateColumn}>
                  <Text style={styles.dateColumnHeader}>Month</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {months.map((month, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dateOption,
                          dateSelection.month === month && styles.selectedDateOption
                        ]}
                        onPress={() => handleDateSelect('month', month)}
                      >
                        <Text style={dateSelection.month === month ? styles.selectedDateText : styles.dateOptionText}>
                          {month}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.dateColumn}>
                  <Text style={styles.dateColumnHeader}>Day</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {days.map((day, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dateOption,
                          dateSelection.day === day && styles.selectedDateOption
                        ]}
                        onPress={() => handleDateSelect('day', day)}
                      >
                        <Text style={dateSelection.day === day ? styles.selectedDateText : styles.dateOptionText}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.dateColumn}>
                  <Text style={styles.dateColumnHeader}>Year</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {years.map((year, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dateOption,
                          dateSelection.year === year && styles.selectedDateOption
                        ]}
                        onPress={() => handleDateSelect('year', year)}
                      >
                        <Text style={dateSelection.year === year ? styles.selectedDateText : styles.dateOptionText}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop:40
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 60,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    color: '#007AFF',
    fontSize: 16,
    width: 60,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
    paddingTop:10
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  selectedText: {
    color: '#000',
    fontSize: 16,
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  interactionOptions: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  interactionOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  selectedInteraction: {
    backgroundColor: '#e6e6e6',
  },
  interactionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  selectedInteractionText: {
    fontWeight: '500',
  },
  dateContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginVertical: 16,
    overflow: 'hidden',
    paddingBottom:10
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedDateRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dateText: {
    fontSize: 16,
    flex: 1,
  },
  dateNumber: {
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  dateTextInactive: {
    color: '#999',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 24,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  datePicker: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePickerDone: {
    fontSize: 16,
    color: '#007AFF',
  },
  dateSelectors: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  dateColumn: {
    flex: 1,
    alignItems: 'center',
    height: 200,
  },
  dateColumnHeader: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  dateOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '100%',
  },
  selectedDateOption: {
    backgroundColor: '#f0f0f0',
  },
  dateOptionText: {
    fontSize: 16,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  }
});

export default NewLogScreen;

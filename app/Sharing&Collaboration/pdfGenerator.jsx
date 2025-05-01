import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export const generatePDF = async (group) => {
  if (!group) {
    Alert.alert("Error", "No group data available.");
    return;
  }

  const { name, description, contacts } = group;
  const membersList = contacts?.length ? contacts.join(", ") : "No members added";

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1E3C72; text-align: center; }
          p { font-size: 16px; }
          .container { border: 1px solid #ddd; padding: 15px; border-radius: 10px; }
          .label { font-weight: bold; color: #007BFF; }
        </style>
      </head>
      <body>
        <h1>Group Summary Report</h1>
        <div class="container">
          <p><span class="label">📌 Group Name:</span> ${name}</p>
          <p><span class="label">📝 Description:</span> ${description || "N/A"}</p>
          <p><span class="label">👥 Members:</span> ${membersList}</p>
          <p><span class="label">📅 Date:</span> ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    if (uri) {
      Alert.alert("Success", "PDF generated successfully!", [
        { text: "View", onPress: () => sharePDF(uri) },
        { text: "OK" },
      ]);
    }
  } catch (error) {
    console.error("PDF Generation Error:", error);
    Alert.alert("Error", "Failed to generate PDF.");
  }
};

const sharePDF = async (filePath) => {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath);
  } else {
    Alert.alert("Error", "Sharing is not available on this device.");
  }
};

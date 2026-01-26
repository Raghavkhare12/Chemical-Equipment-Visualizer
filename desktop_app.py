import sys
import requests
import matplotlib.pyplot as plt

from PyQt5.QtWidgets import (
    QApplication, QWidget, QPushButton, QLabel,
    QVBoxLayout, QFileDialog, QMessageBox
)

class DesktopApp(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Chemical Equipment Visualizer - Desktop")
        self.setGeometry(300, 300, 400, 300)

        self.label = QLabel("Upload CSV to Analyze Equipment", self)

        self.upload_btn = QPushButton("Select CSV File")
        self.upload_btn.clicked.connect(self.upload_file)

        self.result_label = QLabel("")

        layout = QVBoxLayout()
        layout.addWidget(self.label)
        layout.addWidget(self.upload_btn)
        layout.addWidget(self.result_label)

        self.setLayout(layout)

    def upload_file(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Select CSV File", "", "CSV Files (*.csv)"
        )

        if not file_path:
            return

        url = "http://127.0.0.1:8000/api/upload/"

        try:
            with open(file_path, "rb") as f:
                files = {"file": f}
                response = requests.post(url, files=files)

            if response.status_code != 200:
                raise Exception("Upload failed")

            data = response.json()

            self.show_summary(data)
            self.show_charts(data)

        except Exception as e:
            QMessageBox.critical(self, "Error", str(e))

    def show_summary(self, data):
        text = (
            f"Total Equipment: {data['total_count']}\n"
            f"Avg Flowrate: {data['avg_flowrate']}\n"
            f"Avg Pressure: {data['avg_pressure']}\n"
            f"Avg Temperature: {data['avg_temperature']}"
        )
        self.result_label.setText(text)

    def show_charts(self, data):
        # Pie Chart
        types = list(data["type_distribution"].keys())
        values = list(data["type_distribution"].values())

        plt.figure(figsize=(6, 4))
        plt.pie(values, labels=types, autopct="%1.1f%%")
        plt.title("Equipment Type Distribution")
        plt.show()

        # Bar Chart
        labels = ["Flowrate", "Pressure", "Temperature"]
        averages = [
            data["avg_flowrate"],
            data["avg_pressure"],
            data["avg_temperature"],
        ]

        plt.figure(figsize=(6, 4))
        plt.bar(labels, averages)
        plt.title("Average Parameters")
        plt.show()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = DesktopApp()
    window.show()
    sys.exit(app.exec_())

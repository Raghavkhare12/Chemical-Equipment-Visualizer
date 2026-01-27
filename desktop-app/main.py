import sys
import requests

from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QFileDialog, QTableWidget, QTableWidgetItem, QFrame, QTextEdit, QGridLayout,
    QScrollArea
)
from PyQt5.QtGui import QFont
from PyQt5.QtCore import Qt

from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure


API_URL = "http://127.0.0.1:8000/api/upload/"


# ---------------- MAIN APP ---------------- #

class DesktopApp(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Chemical Equipment Parameter Visualizer")
        self.setGeometry(100, 50, 1300, 900)

        self.setStyleSheet("""
        QWidget { background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                  stop:0 #cfe8ff, stop:1 #f6b1d0); }
        QLabel { color:#111; }
        QPushButton {
            background:#1976d2; color:white; padding:8px 18px;
            border-radius:8px; font-weight:bold;
        }
        QPushButton:hover { background:#125aa0; }
        QFrame {
            background:white; border-radius:14px;
        }
        QTableWidget {
            background:white; border-radius:10px;
            gridline-color:#ddd;
        }
        QTextEdit {
            background:white; border-radius:10px; padding:10px;
        }
        """)

        outer = QVBoxLayout(self)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        container = QWidget()
        main = QVBoxLayout(container)
        scroll.setWidget(container)
        outer.addWidget(scroll)

        # ---------- TITLE ---------- #
        title = QLabel("⚗ Chemical Equipment Parameter Visualizer")
        title.setFont(QFont("Segoe UI", 18, QFont.Bold))
        title.setAlignment(Qt.AlignCenter)
        main.addWidget(title)

        # ---------- UPLOAD CARD ---------- #
        upload_card = QFrame()
        upload_layout = QVBoxLayout(upload_card)

        self.upload_btn = QPushButton("Select CSV & Upload")
        self.upload_btn.clicked.connect(self.upload_csv)

        self.status = QLabel("No file uploaded")
        self.status.setAlignment(Qt.AlignCenter)

        upload_layout.addWidget(self.upload_btn, alignment=Qt.AlignCenter)
        upload_layout.addWidget(self.status)

        main.addWidget(upload_card)

        # ---------- SUMMARY CARDS ---------- #
        self.cards_layout = QGridLayout()
        main.addLayout(self.cards_layout)

        self.total_lbl = self.make_card("Total Equipment")
        self.flow_lbl = self.make_card("Avg Flowrate")
        self.press_lbl = self.make_card("Avg Pressure")
        self.temp_lbl = self.make_card("Avg Temperature")

        self.cards_layout.addWidget(self.total_lbl, 0, 0)
        self.cards_layout.addWidget(self.flow_lbl, 0, 1)
        self.cards_layout.addWidget(self.press_lbl, 0, 2)
        self.cards_layout.addWidget(self.temp_lbl, 0, 3)

        # ---------- CHARTS ---------- #
        charts_row = QHBoxLayout()

        self.fig1 = Figure(figsize=(5,4))
        self.canvas1 = FigureCanvas(self.fig1)
        chart_card1 = self.wrap_card("Equipment Type Distribution", self.canvas1)

        self.fig2 = Figure(figsize=(5,4))
        self.canvas2 = FigureCanvas(self.fig2)
        chart_card2 = self.wrap_card("Average Parameters", self.canvas2)

        charts_row.addWidget(chart_card1)
        charts_row.addWidget(chart_card2)

        main.addLayout(charts_row)

        # ---------- TABLE ---------- #
        self.table = QTableWidget()
        self.table.setColumnCount(5)
        self.table.setHorizontalHeaderLabels(
            ["Equipment Name", "Type", "Flowrate", "Pressure", "Temperature"]
        )
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.horizontalHeader().setStretchLastSection(True)

        table_card = self.wrap_card("📋 Equipment Data Table", self.table)
        main.addWidget(table_card)

        # ---------- SUGGESTIONS ---------- #
        self.suggestions = QTextEdit()
        self.suggestions.setReadOnly(True)
        sug_card = self.wrap_card("🧠 Smart System Suggestions", self.suggestions)
        main.addWidget(sug_card)

    # ---------- UI HELPERS ---------- #

    def make_card(self, title):
        frame = QFrame()
        lay = QVBoxLayout(frame)
        t = QLabel(title)
        t.setAlignment(Qt.AlignCenter)
        t.setFont(QFont("Segoe UI", 10, QFont.Bold))
        v = QLabel("--")
        v.setAlignment(Qt.AlignCenter)
        v.setFont(QFont("Segoe UI", 16, QFont.Bold))
        lay.addWidget(t)
        lay.addWidget(v)
        frame.value = v
        return frame

    def wrap_card(self, title, widget):
        frame = QFrame()
        lay = QVBoxLayout(frame)
        lbl = QLabel(title)
        lbl.setFont(QFont("Segoe UI", 11, QFont.Bold))
        lbl.setAlignment(Qt.AlignCenter)
        lay.addWidget(lbl)
        lay.addWidget(widget)
        return frame

    # ---------- BACKEND CALL ---------- #

    def upload_csv(self):
        path, _ = QFileDialog.getOpenFileName(self, "Select CSV", "", "CSV Files (*.csv)")
        if not path:
            return

        self.status.setText("Uploading...")

        try:
            with open(path, "rb") as f:
                r = requests.post(API_URL, files={"file": f}, timeout=15)

            if r.status_code != 200:
                self.status.setText("Upload failed")
                print(r.text)
                return

            data = r.json()



            self.status.setText("Upload successful")

            self.update_summary(data)
            self.update_charts(data)
            self.update_table(data["rows"])
            self.update_suggestions(data["rows"])

        except Exception as e:
            print("ERROR:", e)
            self.status.setText("Server error")

    # ---------- UPDATE UI ---------- #

    def update_summary(self, d):
        self.total_lbl.value.setText(str(d["total_count"]))
        self.flow_lbl.value.setText(f'{d["avg_flowrate"]:.2f}')
        self.press_lbl.value.setText(f'{d["avg_pressure"]:.2f}')
        self.temp_lbl.value.setText(f'{d["avg_temperature"]:.2f}')

    def update_charts(self, d):
        # PIE
        self.fig1.clear()
        ax1 = self.fig1.add_subplot(111)
        ax1.pie(
            d["type_distribution"].values(),
            labels=d["type_distribution"].keys(),
            autopct="%1.0f%%",
            startangle=90
        )
        ax1.set_title("Equipment Types")
        self.canvas1.draw()

        # BAR
        self.fig2.clear()
        ax2 = self.fig2.add_subplot(111)
        ax2.bar(
            ["Flowrate", "Pressure", "Temperature"],
            [d["avg_flowrate"], d["avg_pressure"], d["avg_temperature"]],
            color=["#42a5f5", "#66bb6a", "#ffa726"]
        )
        ax2.set_title("Average Parameters")
        self.canvas2.draw()

    def update_table(self, rows):
        self.table.setRowCount(len(rows))

        for i, r in enumerate(rows):
            self.table.setItem(i, 0, QTableWidgetItem(str(r.get("Equipment Name", ""))))
            self.table.setItem(i, 1, QTableWidgetItem(str(r.get("Type", ""))))
            self.table.setItem(i, 2, QTableWidgetItem(str(r.get("Flowrate", ""))))
            self.table.setItem(i, 3, QTableWidgetItem(str(r.get("Pressure", ""))))
            self.table.setItem(i, 4, QTableWidgetItem(str(r.get("Temperature", ""))))


    def update_suggestions(self, rows):
        msgs = []

        for r in rows:
            name = r.get("Equipment Name", "Unknown")
            typ = r.get("Type", "")
            flow = float(r.get("Flowrate", 0))
            pressure = float(r.get("Pressure", 0))
            temp = float(r.get("Temperature", 0))

            # ---- Pump Rules ----
            if typ == "Pump":
                if pressure < 5:
                    msgs.append(f"⚠ Pump {name}: Low pressure — increase inlet pressure.")
                if flow < 115:
                    msgs.append(f"⚠ Pump {name}: Low flowrate — check impeller or blockage.")

            # ---- Reactor Rules ----
            if typ == "Reactor":
                if temp > 140:
                    msgs.append(f"⚠ Reactor {name}: High temperature — check cooling system.")
                if pressure > 7.0:
                    msgs.append(f"⚠ Reactor {name}: High pressure — inspect safety valves.")

            # ---- Compressor Rules ----
            if typ == "Compressor":
                if pressure < 7:
                    msgs.append(f"⚠ Compressor {name}: Low compression — possible leakage.")

            # ---- Valve Rules ----
            if typ == "Valve":
                if pressure < 4:
                    msgs.append(f"⚠ Valve {name}: Pressure drop detected — possible clogging.")

            # ---- Heat Exchanger ----
            if typ == "HeatExchanger":
                if temp > 125:
                    msgs.append(f"⚠ Heat Exchanger {name}: High outlet temp — poor heat transfer.")

            # ---- Condenser ----
            if typ == "Condenser":
                if temp > 140:
                    msgs.append(f"⚠ Condenser {name}: Inefficient cooling — inspect coolant flow.")

            # ---- Global Safety ----
            if temp > 140:
                msgs.append(f"🚨 {typ} {name}: CRITICAL temperature — immediate shutdown recommended.")

        if not msgs:
            msgs.append("✅ All systems operating within safe operating limits.")

        self.suggestions.setText("\n".join(msgs))



# ---------------- RUN ---------------- #

app = QApplication(sys.argv)
w = DesktopApp()
w.show()
sys.exit(app.exec_())

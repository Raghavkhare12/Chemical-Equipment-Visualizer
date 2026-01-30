import sys
import requests

from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QFileDialog, QTableWidget, QTableWidgetItem, QFrame, QTextEdit,
    QGridLayout, QScrollArea
)
from PyQt5.QtGui import QFont
from PyQt5.QtCore import Qt

from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure

API_URL = "http://127.0.0.1:8000/api/upload/"


# ================= MAIN APP ================= #

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
        QFrame { background:white; border-radius:14px; }
        QTableWidget { background:white; border-radius:10px; }
        QTextEdit { background:white; border-radius:10px; padding:10px; }
        """)

        outer = QVBoxLayout(self)

        # ===== SINGLE SCROLL AREA (WEBPAGE STYLE) =====
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

        # ---------- UPLOAD ---------- #
        upload_card = QFrame()
        upload_layout = QVBoxLayout(upload_card)

        self.upload_btn = QPushButton("Select CSV & Upload")
        self.upload_btn.clicked.connect(self.upload_csv)

        self.status = QLabel("No file uploaded")
        self.status.setAlignment(Qt.AlignCenter)

        upload_layout.addWidget(self.upload_btn, alignment=Qt.AlignCenter)
        upload_layout.addWidget(self.status)
        main.addWidget(upload_card)

        # ---------- SUMMARY ---------- #
        self.cards = QGridLayout()
        main.addLayout(self.cards)

        self.total = self.make_card("Total Equipment")
        self.flow = self.make_card("Avg Flowrate")
        self.press = self.make_card("Avg Pressure")
        self.temp = self.make_card("Avg Temperature")

        self.cards.addWidget(self.total, 0, 0)
        self.cards.addWidget(self.flow, 0, 1)
        self.cards.addWidget(self.press, 0, 2)
        self.cards.addWidget(self.temp, 0, 3)

        # ---------- CHARTS (WEB STYLE) ---------- #

        # PIE CHART
        self.fig_pie = Figure(figsize=(6, 5))
        self.canvas_pie = FigureCanvas(self.fig_pie)
        self.canvas_pie.setMinimumHeight(350)
        self.canvas_pie.setSizePolicy(
            self.canvas_pie.sizePolicy().Expanding,
            self.canvas_pie.sizePolicy().Expanding
        )

        main.addWidget(
            self.wrap_card("Equipment Type Distribution", self.canvas_pie)
        )

        # LINE TREND CHART (BIG)
        self.fig_line = Figure(figsize=(10, 6))
        self.canvas_line = FigureCanvas(self.fig_line)
        self.canvas_line.setMinimumHeight(450)
        self.canvas_line.setSizePolicy(
            self.canvas_line.sizePolicy().Expanding,
            self.canvas_line.sizePolicy().Expanding
        )

        main.addWidget(
            self.wrap_card("Equipment Parameter Trends", self.canvas_line)
        )


        # ---------- DIAGNOSTIC INSIGHTS ---------- #
        self.diagnostics = QTextEdit()
        self.diagnostics.setReadOnly(True)
        self.disable_text_scroll(self.diagnostics)
        main.addWidget(self.wrap_card("📈 Trend Insights & Root Cause Analysis", self.diagnostics))

        # ---------- TABLE ---------- #
        self.table = QTableWidget(0, 5)
        self.table.setHorizontalHeaderLabels(
            ["Equipment Name", "Type", "Flowrate", "Pressure", "Temperature"]
        )
        self.disable_table_scroll(self.table)
        main.addWidget(self.wrap_card("📋 Equipment Data Table", self.table))

        # ---------- SUGGESTIONS ---------- #
        self.suggestions = QTextEdit()
        self.suggestions.setReadOnly(True)
        self.disable_text_scroll(self.suggestions)
        main.addWidget(self.wrap_card("⚠️ Smart System Suggestions", self.suggestions))

    # ================= HELPERS ================= #

    def make_card(self, title):
        f = QFrame()
        l = QVBoxLayout(f)
        t = QLabel(title)
        t.setAlignment(Qt.AlignCenter)
        t.setFont(QFont("Segoe UI", 10, QFont.Bold))
        v = QLabel("--")
        v.setAlignment(Qt.AlignCenter)
        v.setFont(QFont("Segoe UI", 16, QFont.Bold))
        l.addWidget(t)
        l.addWidget(v)
        f.value = v
        return f

    def wrap_card(self, title, widget):
        f = QFrame()
        l = QVBoxLayout(f)
        lbl = QLabel(title)
        lbl.setFont(QFont("Segoe UI", 11, QFont.Bold))
        lbl.setAlignment(Qt.AlignCenter)
        l.addWidget(lbl)
        l.addWidget(widget)
        return f

    def disable_text_scroll(self, widget):
        widget.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        widget.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        widget.setSizeAdjustPolicy(QTextEdit.AdjustToContents)

    def disable_table_scroll(self, table):
        table.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        table.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        table.setSizeAdjustPolicy(QTableWidget.AdjustToContents)

    # ================= BACKEND ================= #

    def upload_csv(self):
        path, _ = QFileDialog.getOpenFileName(self, "Select CSV", "", "CSV Files (*.csv)")
        if not path:
            return

        self.status.setText("Uploading...")

        try:
            with open(path, "rb") as f:
                r = requests.post(API_URL, files={"file": f}, timeout=15)

            data = r.json()
            self.status.setText("Upload successful")

            self.update_summary(data)
            self.update_charts(data)
            self.update_table(data["rows"])
            self.update_suggestions(data["rows"])
            self.update_diagnostics(data["rows"])

        except Exception as e:
            self.status.setText("Server error")
            print(e)

    # ================= UPDATE UI ================= #

    def update_summary(self, d):
        self.total.value.setText(str(d["total_count"]))
        self.flow.value.setText(f'{d["avg_flowrate"]:.2f}')
        self.press.value.setText(f'{d["avg_pressure"]:.2f}')
        self.temp.value.setText(f'{d["avg_temperature"]:.2f}')

    def update_charts(self, d):
        rows = d["rows"]

        self.fig_pie.clear()
        ax = self.fig_pie.add_subplot(111)
        ax.pie(d["type_distribution"].values(),
               labels=d["type_distribution"].keys(),
               autopct="%1.0f%%")
        self.canvas_pie.draw()

        self.fig_line.clear()
        ax = self.fig_line.add_subplot(111)
        names = [r["Equipment Name"] for r in rows]

        ax.plot(names, [r["Flowrate"] for r in rows], label="Flowrate")
        ax.plot(names, [r["Pressure"] for r in rows], label="Pressure")
        ax.plot(names, [r["Temperature"] for r in rows], label="Temperature")

        ax.legend()
        ax.tick_params(axis="x", rotation=45)
        self.canvas_line.draw()

    def update_table(self, rows):
        self.table.setRowCount(len(rows))
        for i, r in enumerate(rows):
            for j, k in enumerate(["Equipment Name", "Type", "Flowrate", "Pressure", "Temperature"]):
                self.table.setItem(i, j, QTableWidgetItem(str(r[k])))

        self.table.resizeRowsToContents()
        self.table.resizeColumnsToContents()

    def update_suggestions(self, rows):
        msgs = []
        for r in rows:
            if r["Temperature"] > 140:
                msgs.append(f"🚨 {r['Equipment Name']}: CRITICAL temperature.")
            if r["Pressure"] < 5:
                msgs.append(f"⚠ {r['Equipment Name']}: Low pressure.")
        self.suggestions.setText("\n".join(msgs) or "✅ All systems normal.")

    def update_diagnostics(self, rows):
        insights = [
            "📈 Trend Insights:",
            "• Declining flowrate trend → possible blockage or wear",
            "• Rising reactor temperature → cooling inefficiency",
            "",
            "🧠 Possible Root Causes:",
            "• Cavitation or suction obstruction in pumps",
            "• Fouling/scaling in heat exchangers",
            "• Outlet restriction causing pressure buildup"
        ]
        self.diagnostics.setText("\n".join(insights))


# ================= RUN ================= #

app = QApplication(sys.argv)
window = DesktopApp()
window.show()
sys.exit(app.exec_())

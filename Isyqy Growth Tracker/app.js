// ====== Ambil elemen ======
const btnTambahSusu = document.getElementById("btnTambahSusu");
const btnTambahBab = document.getElementById("btnTambahBab");
const btnTambahGejala = document.getElementById("btnTambahGejala");
const btnCetak = document.getElementById("btnCetak");

const toggleSusu = document.getElementById("toggleSusu");
const toggleBab = document.getElementById("toggleBab");
const toggleGejala = document.getElementById("toggleGejala");

const tabelSusu = document.getElementById("tabelSusu");
const tabelBab = document.getElementById("tabelBab");
const tabelGejala = document.getElementById("tabelGejala");

const hapusSusu = document.getElementById("hapusSusu");
const hapusBab = document.getElementById("hapusBab");
const hapusGejala = document.getElementById("hapusGejala");

// ====== Fungsi render ======
function renderTabel() {
  const susu = JSON.parse(localStorage.getItem("susu")) || [];
  const bab = JSON.parse(localStorage.getItem("bab")) || [];
  const gejala = JSON.parse(localStorage.getItem("gejala")) || [];

  // SUSU
  const tbodySusu = tabelSusu.querySelector("tbody");
  tbodySusu.innerHTML = "";
  susu.forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.tgl}</td>
      <td>${s.waktu}</td>
      <td>${s.volume}</td>
      <td>${s.status}</td>
    `;
    tbodySusu.appendChild(row);
  });

  // BAB
  const tbodyBab = tabelBab.querySelector("tbody");
  tbodyBab.innerHTML = "";
  bab.forEach(b => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${b.tgl}</td><td>${b.tekstur}</td>`;
    tbodyBab.appendChild(row);
  });

  // GEJALA
  const tbodyGejala = tabelGejala.querySelector("tbody");
  tbodyGejala.innerHTML = "";
  gejala.forEach(g => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${g.tgl}</td><td>${g.status}</td><td>${g.catatan}</td>`;
    tbodyGejala.appendChild(row);
  });
}
renderTabel();

// ====== Fungsi tanggal lokal ======
function getToday() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); 
  return d.toISOString().split("T")[0];
}

// ====== Tambah Data ======
btnTambahSusu.addEventListener("click", () => {
  const waktu = document.getElementById("waktuSusu").value;
  const volume = document.getElementById("volumeSusu").value;
  const status = document.getElementById("statusSusu").value;

  if (!waktu || !volume) {
    alert("Waktu dan volume harus diisi!");
    return;
  }

  const tgl = getToday(); // FIX: tanggal konsisten
  let susu = JSON.parse(localStorage.getItem("susu")) || [];
  susu.push({ tgl, waktu, volume, status });
  localStorage.setItem("susu", JSON.stringify(susu));

  renderTabel();
});

btnTambahBab.addEventListener("click", () => {
  const tgl = document.getElementById("tglBab").value;
  const tekstur = document.getElementById("teksturBab").value;

  if (!tgl) {
    alert("Tanggal BAB harus diisi!");
    return;
  }

  let bab = JSON.parse(localStorage.getItem("bab")) || [];
  bab.push({ tgl, tekstur });
  localStorage.setItem("bab", JSON.stringify(bab));

  renderTabel();
});

btnTambahGejala.addEventListener("click", () => {
  const tgl = document.getElementById("tglGejala").value;
  const status = document.getElementById("statusGejala").value;
  const catatan = document.getElementById("catatanGejala").value;

  if (!tgl) {
    alert("Tanggal gejala harus diisi!");
    return;
  }

  let gejala = JSON.parse(localStorage.getItem("gejala")) || [];
  gejala.push({ tgl, status, catatan });
  localStorage.setItem("gejala", JSON.stringify(gejala));

  renderTabel();
});

// ====== Toggle Tabel ======
function toggleTable(btn, tbl) {
  if (tbl.style.display !== "none") {
    tbl.style.display = "none";
    btn.textContent = "Tampilkan Tabel";
  } else {
    tbl.style.display = "table";
    btn.textContent = "Sembunyikan Tabel";
  }
}

toggleSusu.addEventListener("click", () => toggleTable(toggleSusu, tabelSusu));
toggleBab.addEventListener("click", () => toggleTable(toggleBab, tabelBab));
toggleGejala.addEventListener("click", () => toggleTable(toggleGejala, tabelGejala));

// ====== Hapus Semua ======
hapusSusu.addEventListener("click", () => {
  if (confirm("Hapus semua data susu?")) {
    localStorage.removeItem("susu");
    renderTabel();
  }
});
hapusBab.addEventListener("click", () => {
  if (confirm("Hapus semua data BAB?")) {
    localStorage.removeItem("bab");
    renderTabel();
  }
});
hapusGejala.addEventListener("click", () => {
  if (confirm("Hapus semua data gejala?")) {
    localStorage.removeItem("gejala");
    renderTabel();
  }
});

// ====== Cetak PDF ======
btnCetak.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  const susu = JSON.parse(localStorage.getItem("susu")) || [];
  const bab = JSON.parse(localStorage.getItem("bab")) || [];
  const gejala = JSON.parse(localStorage.getItem("gejala")) || [];

  const filter = arr =>
    arr.filter(x => (!start && !end) || (x.tgl >= start && x.tgl <= end));

  let y = 20;

  const addTable = (title, headers, data, color) => {
    doc.setFontSize(14);
    doc.text(title, 14, y);
    y += 8;

    doc.autoTable({
      startY: y,
      head: [headers],
      body: data,
      theme: "grid",
      headStyles: { fillColor: color },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 }
    });

    y = doc.lastAutoTable.finalY + 10;
  };

  addTable(
    "Konsumsi Susu",
    ["Tanggal", "Waktu", "Volume", "Status"],
    filter(susu).map(s => [s.tgl, s.waktu, s.volume, s.status]),
    [255, 160, 122]
  );

  addTable(
    "BAB",
    ["Tanggal", "Tekstur"],
    filter(bab).map(b => [b.tgl, b.tekstur]),
    [255, 218, 185]
  );

  addTable(
    "Gejala",
    ["Tanggal", "Status", "Catatan"],
    filter(gejala).map(g => [g.tgl, g.status, g.catatan]),
    [240, 128, 128]
  );

  doc.save("laporan_bayi.pdf");
});  // <── ini penutup YANG BENAR

// ====== Default: semua tabel tampil ======
tabelSusu.style.display = "table";
tabelBab.style.display = "table";
tabelGejala.style.display = "table";

// ====== DARK MODE ======
const toggleDark = document.getElementById("toggleDark");

// Load mode dari localStorage
if (localStorage.getItem("darkmode") === "on") {
  document.body.classList.add("dark");
  toggleDark.textContent = "☀️ Light Mode";
}

// Ketika tombol diklik
toggleDark.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("darkmode", "on");
    toggleDark.textContent = "☀️ Light Mode";
  } else {
    localStorage.setItem("darkmode", "off");
    toggleDark.textContent = "🌙 Dark Mode";
  }
});


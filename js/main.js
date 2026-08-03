/**
 * Gudep Penegak Comprehensive Engine
 * Handles Mobile Menu, Tab Switching, and Simulated Google Workspace / Airtable Webhooks
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('open');
            const icon = mobileMenuBtn.querySelector('i');
            if (mainNav.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // 2. Form submission handlers
    setupFormHandler('googleSheetForm', 'formAlert', 'Data pendaftaran berhasil disimpan ke Airtable/Google Sheets!');
    setupFormHandler('skuUploadForm', 'skuAlert', 'Portofolio SKU berhasil dikirim ke Pembina!');
    setupFormHandler('suratForm', 'suratAlert', 'Nomor agenda surat berhasil digenerate.');
    setupFormHandler('rsvpForm', 'rsvpAlert', 'RSVP dan Lembar Izin berhasil diproses.');
    setupFormHandler('pinjamForm', 'pinjamAlert', 'Pengajuan peminjaman inventaris berhasil dicatat.');
});

// Tab Switcher Function
function switchTab(evt, tabId) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    evt.currentTarget.classList.add('active');
}

// Generic Form Handler Helper
function setupFormHandler(formId, alertId, successMessage) {
    const form = document.getElementById(formId);
    const alertBox = document.getElementById(alertId);

    if (form && alertBox) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses ke Database...';
            submitBtn.disabled = true;

            await new Promise(resolve => setTimeout(resolve, 1000));

            alertBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${successMessage}`;
            alertBox.classList.remove('hidden');
            form.reset();

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            setTimeout(() => {
                alertBox.classList.add('hidden');
            }, 6000);
        });
    }
}

const { jsPDF } = window.jspdf;

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return btoa(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash);
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), "Genesis Block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }

    verifyCertificate(hash) {
        return this.chain.some(block => block.hash === hash);
    }
}

const certificateBlockchain = new Blockchain();

function issueCertificate() {
    const name = document.getElementById("certificateName").value;
    const course = document.getElementById("certificateCourse").value;
    
    if (name && course) {
        const newBlock = new Block(
            certificateBlockchain.chain.length,
            Date.now(),
            { name, course },
            certificateBlockchain.getLatestBlock().hash
        );

        certificateBlockchain.addBlock(newBlock);
        updateCertificates();

        document.getElementById("certificateName").value = "";
        document.getElementById("certificateCourse").value = "";
    } else {
        alert("Please enter both Name and Course!");
    }
}

function updateCertificates() {
    const certList = document.getElementById("certificates");
    certList.innerHTML = "";

    certificateBlockchain.chain.forEach((block, index) => {
        if (index !== 0) {
            const li = document.createElement("li");
            li.className = "certificate";
            li.innerHTML = `
                <strong>Certificate ID:</strong> ${block.hash}<br>
                <strong>Name:</strong> ${block.data.name}<br>
                <strong>Course:</strong> ${block.data.course}<br>
                <button onclick="downloadCertificate('${block.hash}', '${block.data.name}', '${block.data.course}')">Download PDF</button>
            `;
            certList.appendChild(li);
        }
    });
}

function downloadCertificate(id, name, course) {
    const doc = new jsPDF("landscape");

    // Background Color
    doc.setFillColor(230, 230, 250); // Light lavender background
    doc.rect(0, 0, 297, 210, "F");

    // Add Borders
    doc.setDrawColor(0, 0, 128); // Dark blue border
    doc.setLineWidth(5);
    doc.rect(10, 10, 277, 190);

    // Date (Top Right)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 270, 20, null, null, "right");

    // Certificate Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.setTextColor(0, 0, 139); // Dark Blue
    doc.text("Certificate of Completion", 148, 50, null, null, "center");

    // Subtitle
    doc.setFont("helvetica", "italic");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0); // Black
    doc.text("This is to certify that", 148, 70, null, null, "center");

    // Recipient Name
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text(name, 148, 90, null, null, "center");

    // Course Information
    doc.setFont("times", "italic");
    doc.setFontSize(16);
    doc.text(`has successfully completed the course:`, 148, 110, null, null, "center");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 69, 0); // Orange Red
    doc.text(course, 148, 130, null, null, "center");

    // Signature Line
    doc.setDrawColor(0);
    doc.line(70, 165, 130, 165); // Signature line
    doc.setFontSize(12);
    doc.text("Authorized Signatory", 80, 175);

    // Certificate ID (Bottom Center)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Certificate ID: ${id}`, 140, 190, null, null, "center");

    // Save PDF
    doc.save(`Certificate_${id}.pdf`);
}

function verifyCertificate() {
    const certId = document.getElementById("verifyCertId").value;
    const resultText = certificateBlockchain.verifyCertificate(certId) 
        ? "Certificate is valid! ✅" 
        : "Certificate not found ❌";
    
    document.getElementById("verificationResult").innerText = resultText;
}

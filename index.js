const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs");
const app = express();
app.use(express.json());
const port = 3500;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/test", (req, res) => {
  res.send("Excelente")
})

app.post("/sendMail", async (req, res) => {
  await sendMail(
    req.body.mail,
    req.body.subject,
    req.body.plain,
    req.body.company,
    req.body.id
  );
  res.send("OK");
});

app.post("/sendSurvey", async (req, res) => {
  await receiveData(req.body);
  res.send("OK");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: "admin@hodweb.dev",
    pass: "3cb1164907",
  },
});

function readFile(filePath, companyName, id) {
  try {
    const data = fs.readFileSync(filePath);
    return data
      .toString()
      .replace(/@%([^]+)%@/g, companyName)
      .replace(/&@([^]+)@&/g, id);
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

async function sendMail(destin, subject, plain, company, id) {
  const text = readFile("image.txt");
  const html = readFile("mail.html", company, id);
  const info = await transporter.sendMail({
    from: '"HOD" <admin@hodweb.dev>',
    to: destin,
    subject: subject,
    text: plain,
    html: html,
    attachments: [
      {
        filename: "logoHod.svg",
        content: Buffer.from(text, "base64"),
        cid: "logoHod",
      },
    ],
  });
}

async function receiveData(data) {
  await transporter.sendMail({
    from: '"HOD" <admin@hodweb.dev>',
    to: "admin@hodweb.dev",
    subject: "Encuesta llenada",
    text: "Datos de la empresa",
    html: `<table>
    <tr>
      <td>Nombre de la Empresa</td>
      <td>${data?.first}</td>
    </tr>
    <tr>
      <td>
        ¿Hay áreas específicas donde sientas que un software personalizado podría
        mejorar la productividad?
      </td>
      <td>${data?.two}</td>
    </tr>
    <tr>
      <td>
        ¿Qué software o programa informático utilizas actualmente para la gestión
        de inventarios (WMS), de transporte(TMS) o de recursos(ERP)?
      </td>
      <td>${data?.three}</td>
    </tr>
    <tr>
      <td>¿Qué aspectos le gustan de la solución actual y que mejorarías?</td>
      <td>${data?.four}</td>
    </tr>
    <tr>
      <td>
        ¿Cuáles son las características clave que esperarías en un software a
        medida para tu empresa?
      </td>
      <td>${data?.five}</td>
    </tr>
    <tr>
      <td>
        ¿Hay integraciones específicas con otras herramientas que consideras
        indispensables?
      </td>
      <td>${data?.six}</td>
    </tr>
    <tr>
      <td>
        ¿Está dispuesto a considerar la adquisición de un software personalizado
        que incorpore inteligencia artificial para optimizar los procesos
        empresariales?
      </td>
      <td>${data?.seven}</td>
    </tr>
    <tr>
      <td>
        ¿Está dispuesto a que te contactemos a través de correo electrónico?
      </td>
      <td>${data?.eight}</td>
    </tr>
  </table>
  <style>
      td:first-child {
          width: 250px;
          font-weight: 600;
      }
      td {
          padding: 16px;
          font-family: Tahoma;
          font-size: 14px;
      }
  </style>`,
  });
}

import QRCode from 'qrcode';
import signatureImage from '@/assets/signature of the founder.png';

export interface CertificateCanvasData {
  studentName: string;
  domainName: string;
  issueDate: string;
  certificateId: string;
  verificationUrl: string;
}

const CANVAS_WIDTH = 1491;
const CANVAS_HEIGHT = 1055;
const NAVY = '#071b52';

function fitTextToWidth(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  fontFamily: string,
  fontStyle = 'normal',
  fontWeight = '400',
) {
  let fontSize = startSize;
  while (fontSize > 18) {
    context.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    if (context.measureText(text).width <= maxWidth) return fontSize;
    fontSize -= 1;
  }
  return fontSize;
}

function drawCenteredText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  startSize: number,
  fontFamily: string,
  fontStyle = 'normal',
  fontWeight = '400',
) {
  const fontSize = fitTextToWidth(context, text, maxWidth, startSize, fontFamily, fontStyle, fontWeight);
  context.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  context.fillStyle = NAVY;
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  context.fillText(text, x, y);
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

async function loadImage(source: string) {
  const image = new Image();
  image.decoding = 'async';
  image.src = source;
  await image.decode();
  return image;
}

export async function generateCertificate(
  templateUrl: string,
  data: CertificateCanvasData,
) {
  const [image, signature] = await Promise.all([
    loadImage(templateUrl),
    loadImage(signatureImage.src),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Certificate canvas is not supported in this browser.');

  context.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // The template leaves a blank field below "This is to certify that".
  drawCenteredText(context, data.studentName.trim(), 745, 462, 900, 58, 'Georgia, serif', 'italic', '700');

  // Fill the underline between the completion statement and "Virtual Internship Program".
  drawCenteredText(context, data.domainName.trim(), 745, 536, 440, 24, 'Arial, sans-serif');

  // The final template has one blank date after "issued on".
  drawCenteredText(context, formatDate(data.issueDate), 1040, 568, 260, 21, 'Arial, sans-serif');

  // Keep the sign-off block in the lower-left footer, clear of the central seal.
  context.textAlign = 'left';
  context.textBaseline = 'alphabetic';
  context.fillStyle = NAVY;
  context.font = '400 18px Arial, sans-serif';
  context.fillText('Best Regards,', 78, 786);
  context.drawImage(signature, 78, 795, 230, 68);
  context.font = '700 17px Arial, sans-serif';
  context.fillText('Founder & Program Coordinator', 78, 883);
  context.font = '400 16px Arial, sans-serif';
  context.fillText('InternJourneys AI Solutions', 78, 907);

  // Fill the remaining reserved footer field from the issued certificate record.
  drawCenteredText(context, `Certificate ID: ${data.certificateId}`, 1100, 929, 360, 16, 'Arial, sans-serif', 'normal', '700');

  const qrDataUrl = await QRCode.toDataURL(data.verificationUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 112,
    color: { dark: NAVY, light: '#ffffff' },
  });
  const qrImage = await loadImage(qrDataUrl);
  context.drawImage(qrImage, 1290, 756, 112, 112);

  return canvas;
}

export function certificateFileName(studentName: string) {
  const safeName = studentName
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'Student';
  return `InternJourneys_Certificate_${safeName}.png`;
}
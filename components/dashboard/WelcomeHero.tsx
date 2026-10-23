'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, CreditCard, Calendar, Download, Loader2 } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { jsPDF } from 'jspdf';
import { errorMessage } from '@/lib/errorMessage';

interface WelcomeHeroProps {
  user: UserProfile;
}

async function imageToDataUrl(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function drawRichParagraph(
  doc: jsPDF,
  segments: { text: string; bold?: boolean }[],
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = segments.flatMap((segment) =>
    segment.text.split(/(\s+)/).filter(Boolean).map((text) => ({ text, bold: segment.bold }))
  );
  let line: { text: string; bold?: boolean }[] = [];
  let lineWidth = 0;

  const drawLine = () => {
    let cursor = x;
    line.forEach((word) => {
      doc.setFont('helvetica', word.bold ? 'bold' : 'normal');
      doc.text(word.text, cursor, y);
      cursor += doc.getTextWidth(word.text);
    });
    y += lineHeight;
    line = [];
    lineWidth = 0;
  };

  words.forEach((word) => {
    doc.setFont('helvetica', word.bold ? 'bold' : 'normal');
    const wordWidth = doc.getTextWidth(word.text);
    if (line.length > 0 && lineWidth + wordWidth > maxWidth) drawLine();
    line.push(word);
    lineWidth += wordWidth;
  });
  if (line.length > 0) drawLine();
  return y;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ user }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadInternJourneysOfferLetter = async () => {
    try {
      setDownloading(true);
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const navy = '#092957';
      const blue = '#1769D1';
      const ink = '#14284A';
      const muted = '#6A7890';
      const footerHeight = 88;
      const today = new Date().toISOString().slice(0, 10);
      const letterId = `IJAS/INT/${today.replace(/-/g, '')}/${user.internId.replace(/[^A-Z0-9]/gi, '').slice(-6)}`;
      const [topMarginImage, bottomMarginImage, signatureImage, stampImage, msmeImage] = await Promise.all([
        imageToDataUrl('/assets/topmargin.png'),
        imageToDataUrl('/assets/bottom-margin.png'),
        imageToDataUrl('/assets/signature-founder.png'),
        imageToDataUrl('/assets/stamp.png'),
        imageToDataUrl('/assets/image.jpg'),
      ]);

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.addImage(topMarginImage, 'PNG', 0, 0, pageWidth, 127, undefined, 'FAST');
      doc.addImage(bottomMarginImage, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight, undefined, 'FAST');

      doc.setTextColor(muted);
      doc.setFontSize(7);
      doc.text('EMPOWERING', 36, 160);
      doc.text('THE NEXT', 36, 175);
      doc.text('GENERATION', 36, 190);
      doc.setTextColor(ink);
      doc.setFont('helvetica', 'bold');
      doc.text(`Date: ${today}`, pageWidth - 164, 160);
      doc.text(`Offer ID: ${letterId}`, pageWidth - 164, 177);

      doc.setFontSize(17);
      doc.setTextColor(navy);
      doc.text('INTERNSHIP OFFER LETTER', pageWidth / 2, 225, { align: 'center' });
      doc.setDrawColor(blue);
      doc.setLineWidth(1.5);
      doc.line(pageWidth / 2 - 96, 234, pageWidth / 2 + 96, 234);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(ink);
      let y = 275;
      const left = 36;
      const maxWidth = pageWidth - 72;
      const paragraphs: { text: string; bold?: boolean }[][] = [
        [{ text: `Dear ${user.name},`, bold: true }],
        [
          { text: 'We are pleased to offer you the position of ' },
          { text: `${user.domain} Intern`, bold: true },
          { text: ' at ' },
          { text: 'InternJourneys AI Solutions', bold: true },
          { text: '. We are excited to welcome you to our virtual internship program and look forward to supporting your learning and professional development.' },
        ],
        [
          { text: 'This internship is designed to provide practical, hands-on learning experience, real-world projects, and industry-relevant skills to help you build a strong foundation in the field of ' },
          { text: user.domain, bold: true },
          { text: '. Through this program, you will gain access to structured learning materials, guided tasks, and projects to enhance your technical and problem-solving abilities.' },
        ],
        [{ text: 'You are required to log in to the InternJourneys platform, complete all assigned tasks, submit your work, and track your progress through the internship dashboard. We encourage you to actively participate, maintain professionalism, and make the most of this learning opportunity.' }],
        [{ text: 'Upon successful completion of all internship requirements, you will be awarded an Internship Completion Certificate in recognition of your dedication and achievements.' }],
        [{ text: 'We are confident that this internship will be a valuable step in your career journey and we look forward to seeing your growth and success with ' }, { text: 'InternJourneys AI Solutions', bold: true }, { text: '.' }],
        [{ text: 'Welcome to the InternJourneys community!' }],
      ];
      paragraphs.forEach((paragraph, index) => {
        y = drawRichParagraph(doc, paragraph, left, y, maxWidth, 15);
        y += index === 0 ? 18 : 12;
      });

      doc.setTextColor(ink);
      doc.setFontSize(10);
      doc.text('Best Regards,', left, 630);
      doc.addImage(signatureImage, 'PNG', left, 638, 112, 40, undefined, 'FAST');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Founder & Program Coordinator', left, 688);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(muted);
      doc.text('InternJourneys AI Solutions', left, 701);
      doc.addImage(stampImage, 'PNG', pageWidth - 222, 620, 82, 82, undefined, 'FAST');
      doc.addImage(msmeImage, 'PNG', pageWidth - 122, 626, 82, 76, undefined, 'FAST');
      doc.save(`InternJourneys_Offer_Letter_${user.internId}.pdf`);
    } catch (err: unknown) {
      alert(errorMessage(err, 'Error downloading offer letter PDF.'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative w-full rounded-3xl text-white p-6 sm:p-8 lg:p-10 shadow-hero overflow-hidden border border-indigo-900/50">

      {/* Dashboard hero background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/bagr.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/35" />
      </div>

      {/* Grid Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* Left Column: Student Welcome */}
        <div className="lg:col-span-7 space-y-6">

          {/* Welcome Label */}
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-indigo-200 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
            <span>Welcome Intern</span>
            <span className="animate-bounce">👋</span>
          </div>

          {/* Student Name & Domain Pill */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {user.name}
            </h1>
            <div className="inline-block">
              <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white/10 text-indigo-100 border border-white/15 backdrop-blur-md shadow-xs">
                {user.domain}
              </span>
            </div>
          </div>

        </div>

        {/* Right Column: Meta + Actions */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end pt-4 lg:pt-0">
          <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 sm:p-7 w-full max-w-[380px] shadow-2xl space-y-5">

            {/* Metadata Row */}
            <div className="grid grid-cols-3 gap-4 text-center">
              {/* Intern ID */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-2 rounded-xl bg-white/10 border border-white/10 text-indigo-200">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-indigo-200/80 font-medium uppercase tracking-wide">Intern ID</p>
                  <p className="font-bold text-white tracking-wide text-[11px] sm:text-xs">{user.internId}</p>
                </div>
              </div>

              {/* Joined Date */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-2 rounded-xl bg-white/10 border border-white/10 text-indigo-200">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-indigo-200/80 font-medium uppercase tracking-wide">Joined On</p>
                  <p className="font-bold text-white text-[11px] sm:text-xs">{user.joinedOn}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] text-indigo-200/80 font-medium uppercase tracking-wide">Status</p>
                  <p className="font-bold text-emerald-400 text-[11px] sm:text-xs">{user.status}</p>
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="border-t border-white/10" />

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Download Offer Letter */}
              <button
                onClick={handleDownloadInternJourneysOfferLetter}
                disabled={downloading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-900 hover:bg-slate-100 shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <Download className="w-4 h-4 text-indigo-600" />}
                <span>{downloading ? "Downloading..." : "Download Offer Letter"}</span>  
              </button>

              {/* Pay & Request */}
              <Link
                href="/dashboard/payments"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-900 hover:bg-slate-100 shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>Pay & Request</span>
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

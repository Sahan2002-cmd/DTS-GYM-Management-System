using GymManagement.Models;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Printing;
using System.IO;
using System.Linq;
using System.Web;
using System.Xml.Linq;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace GymManagement.BusinessLayer
{
    public class PdfReportGenerator
    {
        private static iTextSharp.text.Font TitleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18, new BaseColor(30, 30, 30));
        private static iTextSharp.text.Font HeaderFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11, BaseColor.WHITE);
        private static iTextSharp.text.Font CellFont = FontFactory.GetFont(FontFactory.HELVETICA, 9, new BaseColor(50, 50, 50));
        private static BaseColor GymColor = new BaseColor(26, 188, 156);  // teal

        // ── PAYMENT RECEIPT ──────────────────────────────────────────
        public static byte[] GeneratePaymentReceipt(PaymentModel payment)
        {
            using (var ms = new MemoryStream())
            {
                var doc = new Document(PageSize.A5, 40, 40, 60, 60);
                PdfWriter.GetInstance(doc, ms);
                doc.Open();

                // Header
                _ = doc.Add(new Paragraph("DTS GYM", TitleFont) { Alignment = Element.ALIGN_CENTER });
                doc.Add(new Paragraph("Payment Receipt", FontFactory.GetFont(FontFactory.HELVETICA, 12))
                { Alignment = Element.ALIGN_CENTER });
                doc.Add(Chunk.NEWLINE);

                // Table
                PdfPTable table = new PdfPTable(2) { WidthPercentage = 100 };
                AddReceiptRow(table, "Payment ID", payment.paymentId?.ToString());
                AddReceiptRow(table, "Member", payment.memberName);
                AddReceiptRow(table, "Plan", payment.planType);
                AddReceiptRow(table, "Amount", $"Rs. {payment.paymentAmount:F2}");
                AddReceiptRow(table, "Payment Type", payment.payment_type);
                AddReceiptRow(table, "Payment Status", payment.payment_status);
                AddReceiptRow(table, "Date", payment.payment_date);
                doc.Add(table);

                doc.Add(Chunk.NEWLINE);
                doc.Add(new Paragraph("Thank you for choosing DTS GYM!",
                         FontFactory.GetFont(FontFactory.HELVETICA_OBLIQUE, 10))
                { Alignment = Element.ALIGN_CENTER });

                doc.Close();
                return ms.ToArray();
            }
        }

        // ── GENERAL REPORT ────────────────────────────────────────────
        public static byte[] GenerateReport(string reportType, object data,
                                            string dateFrom, string dateTo)
        {
            using (var ms = new MemoryStream())
            {
                var doc = new Document(PageSize.A4.Rotate(), 30, 30, 50, 50);
                PdfWriter.GetInstance(doc, ms);
                doc.Open();

                // Title
                doc.Add(new Paragraph("DTS GYM Management System", TitleFont)
                { Alignment = Element.ALIGN_CENTER });
                doc.Add(new Paragraph($"{reportType.ToUpper()} REPORT",
                         FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14))
                { Alignment = Element.ALIGN_CENTER });

                if (!string.IsNullOrEmpty(dateFrom))
                    doc.Add(new Paragraph($"Period: {dateFrom} to {dateTo ?? "Now"}",
                             FontFactory.GetFont(FontFactory.HELVETICA, 9))
                    { Alignment = Element.ALIGN_CENTER });

                doc.Add(new Paragraph($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm}",
                         FontFactory.GetFont(FontFactory.HELVETICA, 9))
                { Alignment = Element.ALIGN_RIGHT });
                doc.Add(Chunk.NEWLINE);

                // Data table
                if (data is IEnumerable list)
                {
                    bool headerDone = false;
                    PdfPTable table = null;

                    foreach (System.Collections.Generic.Dictionary<string, object> row in list)
                    {
                        if (!headerDone)
                        {
                            table = new PdfPTable(row.Keys.Count) { WidthPercentage = 100 };
                            foreach (string key in row.Keys)
                            {
                                var cell = new PdfPCell(new Phrase(key, HeaderFont))
                                {
                                    BackgroundColor = GymColor,
                                    Padding = 6,
                                    HorizontalAlignment = Element.ALIGN_CENTER
                                };
                                table.AddCell(cell);
                            }
                            headerDone = true;
                        }

                        foreach (object val in row.Values)
                        {
                            table.AddCell(new PdfPCell(new Phrase(val?.ToString() ?? "", CellFont))
                            { Padding = 5 });
                        }
                    }

                    if (table != null) doc.Add(table);
                }

                doc.Close();
                return ms.ToArray();
            }
        }

        private static void AddReceiptRow(PdfPTable t, string label, string value)
        {
            t.AddCell(new PdfPCell(new Phrase(label, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10)))
            { BackgroundColor = new BaseColor(240, 240, 240), Padding = 6 });
            t.AddCell(new PdfPCell(new Phrase(value ?? "-", CellFont)) { Padding = 6 });
        }
    }
}
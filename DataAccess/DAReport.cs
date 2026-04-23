using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using GymManagement.Models;
using GymManagement.BusinessLayer;
namespace GymManagement.DataAccess
{
    public class DAReport : IReport
    {
        private readonly string ProcName = "GYM_REPORT_PROC";

        public Response MemberReport(string df, string dt)
            => Fetch("001", df, dt, null);

        public Response TrainerReport(string df, string dt)
            => Fetch("002", df, dt, null);

        public Response UserReport(string df, string dt)
            => Fetch("003", df, dt, null);

        public Response AttendanceReport(int? memberId, string df, string dt)
            => Fetch("004", df, dt, memberId);

        public Response SubscriptionReport(string df, string dt)
            => Fetch("005", df, dt, null);

        public Response PaymentReport(string df, string dt)
            => Fetch("006", df, dt, null);

        public Response ExportToPdf(string reportType, string df, string dt, int? memberId)
        {
            Response dataRes;
            switch (reportType)
            {
                case "member": dataRes = MemberReport(df, dt); break;
                case "trainer": dataRes = TrainerReport(df, dt); break;
                case "attendance": dataRes = AttendanceReport(memberId, df, dt); break;
                case "subscription": dataRes = SubscriptionReport(df, dt); break;
                case "payment": dataRes = PaymentReport(df, dt); break;
                case "schedule": dataRes = Fetch("007", df, dt, null); break;
                case "trainer_assignment": dataRes = Fetch("008", df, dt, null); break;
                default: dataRes = MemberReport(df, dt); break;
            }

            if (dataRes.StatusCode != 200) return dataRes;

            byte[] pdf = PdfReportGenerator.GenerateReport(
                            reportType, dataRes.ResultSet, df, dt);

            return new Response
            {
                StatusCode = 200,
                ResultSet = System.Convert.ToBase64String(pdf)
            };
        }

        //private Response Fetch(string actionType, string df, string dt, int? memberId)
        //{
        //    var result = new Response();
        //    var req = new
        //    {
        //        p_action_type = actionType,
        //        p_date_from = df,
        //        p_date_to = dt,
        //        p_member_id = memberId
        //    };

        //    using (var db = new DBconnect())
        //    {
        //        var res = db.ProcedureRead(req, ProcName);
        //        if (res.ResultStatusCode == "1")
        //        {
        //            var rows = new List<System.Collections.Generic.Dictionary<string, object>>();
        //            foreach (DataRow row in res.ResultDataTable.Rows)
        //            {
        //                var dict = new System.Collections.Generic.Dictionary<string, object>();
        //                foreach (DataColumn col in res.ResultDataTable.Columns)
        //                    dict[col.ColumnName] = row[col];
        //                rows.Add(dict);
        //            }
        //            result.ResultSet = rows;
        //            result.StatusCode = 200;
        //        }
        //        else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
        //    }
        //    return result;
        //}

        // REPLACE Fetch method:
        private Response Fetch(string actionType, string df, string dt, int? memberId)
        {
            var result = new Response();
            var req = new
            {
                p_action_type = actionType,
                p_date_from = string.IsNullOrWhiteSpace(df) ? null : df,
                p_date_to = string.IsNullOrWhiteSpace(dt) ? null : dt,
                p_member_id = memberId
            };

            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var rows = new List<Dictionary<string, object>>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        var dict = new Dictionary<string, object>();
                        foreach (DataColumn col in res.ResultDataTable.Columns)
                            dict[col.ColumnName] = row[col] == DBNull.Value ? null : row[col];
                        rows.Add(dict);
                    }
                    result.ResultSet = rows;
                    result.StatusCode = 200;
                    // Guard: return 204 with message if no data found
                    if (rows.Count == 0)
                    {
                        result.StatusCode = 200;
                        result.Result = "No data found for the selected date range.";
                    }
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }
    }
}
using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace GymManagement.DataAccess
{
    public class DAComplain : IComplaint
    {
        private readonly string ProcName = "GYM_COMPLAINT_PROC";

        public Response GetAll()
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(new ComplaintRequestModel { p_action_type = "001" }, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<ComplaintModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapComplaint(row));
                    result.ResultSet = list;
                    result.StatusCode = 200;
                }
                else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
            }
            return result;
        }

        public Response GetById(int complaintId)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(new ComplaintRequestModel { p_action_type = "002", p_complaintId = complaintId }, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<ComplaintModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapComplaint(row));
                    result.ResultSet = list;
                    result.StatusCode = 200;
                }
                else { result.StatusCode = 404; result.Result = "Not found."; }
            }
            return result;
        }

        public Response GetByUser(int userId)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(new ComplaintRequestModel { p_action_type = "003", p_userId = userId }, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<ComplaintModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapComplaint(row));
                    result.ResultSet = list;
                    result.StatusCode = 200;
                }
                else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
            }
            return result;
        }

        public Response AddComplaint(ComplaintRequestModel req)
        {
            req.p_action_type = "004";
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(req, ProcName);
                return new Response { StatusCode = res.ResultStatusCode == "1" ? 200 : 500, Result = res.ExceptionMessage };
            }
        }

        public Response UpdateStatus(int complaintId, string status, int adminId)
        {
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(new ComplaintRequestModel { p_action_type = "005", p_complaintId = complaintId, p_status = status, p_adminId = adminId }, ProcName);
                return new Response { StatusCode = res.ResultStatusCode == "1" ? 200 : 500, Result = res.ExceptionMessage };
            }
        }

        public Response AddRating(int complaintId, int rating)
        {
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(new ComplaintRequestModel { p_action_type = "006", p_complaintId = complaintId, p_rating = rating }, ProcName);
                return new Response { StatusCode = res.ResultStatusCode == "1" ? 200 : 500, Result = res.ExceptionMessage };
            }
        }

        private ComplaintModel MapComplaint(DataRow row)
        {
            return new ComplaintModel
            {
                complaintId = Convert.ToInt32(row["complaintId"]),
                userId = Convert.ToInt32(row["userId"]),
                userFullName = row["userFullName"]?.ToString(),
                type = row["type"]?.ToString(),
                targetUserId = row["targetUserId"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["targetUserId"]),
                targetUserName = row["targetUserName"]?.ToString(),
                message = row["message"]?.ToString(),
                rating = row["rating"] == DBNull.Value ? 0 : Convert.ToInt32(row["rating"]),
                status = row["status"]?.ToString(),
                created_date = row["created_date"]?.ToString()
            };
        }
    }
}
using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace GymManagement.DataAccess
{
    public class DAMember : IMember
    {
        private readonly string ProcName = "GYM_MEMBER_PROC";

        public Response GetAllMembers()
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var req = new MemberRequestModel { p_action_type = "001" };
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<MemberModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapMember(row));
                    result.ResultSet = list;
                    result.StatusCode = 200;
                }
                else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
            }
            return result;
        }

        public Response GetMemberById(int memberId)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var req = new MemberRequestModel { p_action_type = "002", p_member_id = memberId };
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    result.ResultSet = res.ResultDataTable.Rows.Count > 0
                                        ? (object)MapMember(res.ResultDataTable.Rows[0]) : null;
                    result.StatusCode = 200;
                }
                else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
            }
            return result;
        }

        public Response GetMemberByUserId(int userId)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var req = new MemberRequestModel { p_action_type = "007", p_user_id = userId };
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    result.ResultSet = res.ResultDataTable.Rows.Count > 0
                                        ? (object)MapMember(res.ResultDataTable.Rows[0]) : null;
                    result.StatusCode = 200;
                }
                else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
            }
            return result;
        }

        public Response AddMember(MemberRequestModel req)
        {
            var result = new Response();
            req.p_action_type = "003";
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(req, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 500;
                result.Result = res.ResultStatusCode == "1" ? "Member created." : res.ExceptionMessage;
            }
            return result;
        }

        public Response EditMember(MemberRequestModel req)
        {
            var result = new Response();
            req.p_action_type = "004";
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(req, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 500;
                result.Result = res.ExceptionMessage;
            }
            return result;
        }

        public Response DeleteMember(int memberId, int adminId)
        {
            var result = new Response();
            var req = new MemberRequestModel
            {
                p_action_type = "005",
                p_member_id = memberId,
                p_admin_id = adminId
            };
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(req, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 500;
                result.Result = res.ExceptionMessage;
            }
            return result;
        }

        private MemberModel MapMember(DataRow row) => new MemberModel
        {
            memberId = row["memberId"] != DBNull.Value ? Convert.ToInt32(row["memberId"]) : (int?)null,
            userId = row["userId"] != DBNull.Value ? Convert.ToInt32(row["userId"]) : (int?)null,
            firstName = row["firstName"]?.ToString(),
            lastName = row["lastName"]?.ToString(),
            joinDate = row["joinDate"]?.ToString(),
            blood_group = row["blood_group"]?.ToString(),
            height = row["height"] != DBNull.Value ? Convert.ToDecimal(row["height"]) : (decimal?)null,
            weight = row["weight"] != DBNull.Value ? Convert.ToDecimal(row["weight"]) : (decimal?)null,
            fitness_goal = row["fitness_goal"]?.ToString(),
            rfId_Id = row["rfId_Id"] != DBNull.Value ? Convert.ToInt32(row["rfId_Id"]) : (int?)null,
            email = row.Table.Columns.Contains("email") ? row["email"]?.ToString() : null,
            phone = row.Table.Columns.Contains("phone") ? row["phone"]?.ToString() : null,
            status = row.Table.Columns.Contains("status") ? row["status"]?.ToString() : null
        };
    }
}
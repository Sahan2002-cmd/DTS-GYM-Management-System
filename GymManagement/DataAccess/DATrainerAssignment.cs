// ============================================================
//  File : DataAccess/DATrainerAssignment.cs
//  Proc : GYM_TRAINER_ASSIGNMENT_PROC
// ============================================================
using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace GymManagement.DataAccess
{
    public class DATrainerAssignment : ITrainerAssignment
    {
        private readonly string ProcName = "GYM_TRAINER_ASSIGNMENT_PROC";

        public Response GetAll()
        {
            return Read(new TrainerAssignmentRequestModel { p_action_type = "001" });
        }

        public Response GetById(int assignmentId)
        {
            return Read(new TrainerAssignmentRequestModel
            {
                p_action_type = "002",
                p_assignment_id = assignmentId
            });
        }

        public Response GetByMember(int memberId)
        {
            return Read(new TrainerAssignmentRequestModel
            {
                p_action_type = "003",
                p_member_id = memberId
            });
        }

        public Response GetByTrainer(int trainerId)
        {
            return Read(new TrainerAssignmentRequestModel
            {
                p_action_type = "004",
                p_trainer_id = trainerId
            });
        }

        public Response Add(TrainerAssignmentRequestModel req)
        {
            req.p_action_type = "005";
            req.p_status = "Pending";
            return Exec(req, "Trainer request sent successfully.");
        }

        public Response UpdateStatus(int assignmentId, string status, int adminId)
        {
            var res = Exec(new TrainerAssignmentRequestModel
            {
                p_action_type = "010",
                p_assignment_id = assignmentId,
                p_status = status,
                p_admin_id = adminId
            }, $"Request {status} successfully.");

            if (res.StatusCode == 200 && status.ToLower() == "approved")
            {
                try
                {
                    var assignRes = GetById(assignmentId);
                    if (assignRes.StatusCode == 200 && assignRes.ResultSet is List<TrainerAssignmentModel> list && list.Count > 0)
                    {
                        var assign = list[0];
                        using (var db = new DBconnect())
                        {
                            var mRes = db.ProcedureRead(new { p_action_type = "002", p_user_id = assign.memberId }, "GYM_USER_PROC");
                            var tRes = db.ProcedureRead(new { p_action_type = "002", p_user_id = assign.trainerId }, "GYM_USER_PROC");

                            if (mRes.ResultStatusCode == "1" && tRes.ResultStatusCode == "1")
                            {
                                var mRow = mRes.ResultDataTable.Rows[0];
                                var tRow = tRes.ResultDataTable.Rows[0];
                                string mEmail = mRow["email"]?.ToString();
                                string mName = mRow["username"]?.ToString();
                                string tName = tRow["username"]?.ToString();

                                if (!string.IsNullOrEmpty(mEmail))
                                {
                                    GymManagement.BusinessLayer.EmailHelper.SendTrainerApprovalEmail(mEmail, tName, mName);
                                }
                            }
                        }
                    }
                }
                catch { /* Silent fail for email */ }
            }
            return res;
        }

        public Response Delete(int assignmentId, int adminId)
        {
            return Exec(new TrainerAssignmentRequestModel
            {
                p_action_type = "006",
                p_assignment_id = assignmentId,
                p_admin_id = adminId
            }, "Trainer assignment deleted successfully.");
        }

        // ── Private Helpers ───────────────────────────────────────────
        private Response Read(TrainerAssignmentRequestModel req)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<TrainerAssignmentModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapRow(row));

                    result.ResultSet = list;
                    result.StatusCode = 200;
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        private Response Exec(TrainerAssignmentRequestModel req, string successMsg)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(req, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 500;
                result.Result = res.ResultStatusCode == "1"
                                    ? successMsg
                                    : res.ExceptionMessage;
            }
            return result;
        }

        private TrainerAssignmentModel MapRow(DataRow row) =>
            new TrainerAssignmentModel
            {
                assignmentId = row["assignmentId"] != DBNull.Value
                                  ? Convert.ToInt32(row["assignmentId"]) : (int?)null,
                trainerId = row["trainerId"] != DBNull.Value
                                  ? Convert.ToInt32(row["trainerId"]) : (int?)null,
                memberId = row["memberId"] != DBNull.Value
                                  ? Convert.ToInt32(row["memberId"]) : (int?)null,
                assignment_date = row["assignment_date"]?.ToString(),
                status = row["status"]?.ToString(),
                trainerName = row.Table.Columns.Contains("trainerName")
                                  ? row["trainerName"]?.ToString() : null,
                memberName = row.Table.Columns.Contains("memberName")
                                  ? row["memberName"]?.ToString() : null
            };
    }
}
using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace GymManagement.DataAccess
{
    public class DAEquipmentAssignment : IEquipmentAssignment
    {
        private readonly string ProcName = "GYM_EQUIPMENT_ASSIGNMENT_PROC";

        public Response GetAll()
        {
            return Read(new EquipmentAssignmentRequestModel { p_action_type = "001" });
        }

        public Response GetById(int eaId)
        {
            return Read(new EquipmentAssignmentRequestModel
            {
                p_action_type = "002",
                p_ea_id = eaId
            });
        }

        public Response GetBySchedule(int scheduleId)
        {
            return Read(new EquipmentAssignmentRequestModel
            {
                p_action_type = "003",
                p_schedule_id = scheduleId
            });
        }

        public Response GetByMember(int memberId)
        {
            return Read(new EquipmentAssignmentRequestModel
            {
                p_action_type = "004",
                p_member_id = memberId
            });
        }

        public Response Add(EquipmentAssignmentRequestModel req)
        {
            req.p_action_type = "005";
            return Exec(req, "Equipment assignment created successfully.");
        }

        public Response Edit(EquipmentAssignmentRequestModel req)
        {
            req.p_action_type = "006";
            return Exec(req, "Equipment assignment updated successfully.");
        }

        public Response Delete(int eaId, int adminId)
        {
            return Exec(new EquipmentAssignmentRequestModel
            {
                p_action_type = "007",
                p_ea_id = eaId,
                p_admin_id = adminId
            }, "Equipment assignment deleted successfully.");
        }

        // ── Private Helpers ───────────────────────────────────────────
        private Response Read(EquipmentAssignmentRequestModel req)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<EquipmentAssignmentModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapRow(row));

                    result.ResultSet = list.Count == 1 ? (object)list[0] : list;
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

        private Response Exec(EquipmentAssignmentRequestModel req, string successMsg)
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

        private EquipmentAssignmentModel MapRow(DataRow row) =>
            new EquipmentAssignmentModel
            {
                ea_Id = row["ea_Id"] != DBNull.Value
                                ? Convert.ToInt32(row["ea_Id"]) : (int?)null,
                equipmentId = row["equipmentId"] != DBNull.Value
                                ? Convert.ToInt32(row["equipmentId"]) : (int?)null,
                scheduleId = row["scheduleId"] != DBNull.Value
                                ? Convert.ToInt32(row["scheduleId"]) : (int?)null,
                trainerId = row["trainerId"] != DBNull.Value
                                ? Convert.ToInt32(row["trainerId"]) : (int?)null,
                memberId = row["memberId"] != DBNull.Value
                                ? Convert.ToInt32(row["memberId"]) : (int?)null,
                target_mins = row["target_mins"] != DBNull.Value
                                ? Convert.ToInt32(row["target_mins"]) : (int?)null,
                equipmentName = row.Table.Columns.Contains("equipmentName")
                                ? row["equipmentName"]?.ToString() : null,
                memberName = row.Table.Columns.Contains("memberName")
                                ? row["memberName"]?.ToString() : null
            };
    }
}
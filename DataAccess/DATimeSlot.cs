using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace GymManagement.DataAccess
{
    public class DATimeSlot : ITimeSlot
    {
        private readonly string ProcName = "GYM_TIMESLOT_PROC";

        public Response GetAll()
        {
            return Read(new TimeSlotRequestModel { p_action_type = "001" });
        }

        public Response GetById(int timeslotId)
        {
            return Read(new TimeSlotRequestModel
            {
                p_action_type = "002",
                p_timeslot_id = timeslotId
            });
        }

        public Response Add(TimeSlotRequestModel req)
        {
            req.p_action_type = "003";
            return Exec(req, "Time slot created successfully.");
        }

        public Response Edit(TimeSlotRequestModel req)
        {
            req.p_action_type = "004";
            return Exec(req, "Time slot updated successfully.");
        }

        public Response Delete(int timeslotId, int adminId)
        {
            return Exec(new TimeSlotRequestModel
            {
                p_action_type = "005",
                p_timeslot_id = timeslotId,
                p_admin_id = adminId
            }, "Time slot deleted successfully.");
        }

        // ── Private Helpers ───────────────────────────────────────────
        private Response Read(TimeSlotRequestModel req)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<TimeslotModel>();
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

        private Response Exec(TimeSlotRequestModel req, string successMsg)
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

        private TimeslotModel MapRow(DataRow row) =>
            new TimeslotModel
            {
                timeslot_Id = row["timeslot_Id"] != DBNull.Value
                              ? Convert.ToInt32(row["timeslot_Id"]) : (int?)null,
                starttime = row["starttime"]?.ToString(),
                endtime = row["endtime"]?.ToString()
            };
    }
}
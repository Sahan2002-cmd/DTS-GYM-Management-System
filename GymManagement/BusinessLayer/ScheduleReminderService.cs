// ============================================================
//  File : BusinessLayer/ScheduleReminderService.cs
//  Purpose : Detect members who missed/did not complete their
//            scheduled sessions and send WhatsApp notifications.
//
//  USAGE — call once daily (e.g., 10 PM):
//    ScheduleReminderService.NotifyIncompleteSchedules();
// ============================================================
using GymManagement.BusinessLogic;
using GymManagement.Database_Layer;
using GymManagement.Models;
using System;
using System.Data;
using System.Threading.Tasks;

namespace GymManagement.BusinessLayer
{
    public static class ScheduleReminderService
    {
        /// <summary>
        /// Finds all schedules for TODAY where status = 'Pending'
        /// (i.e., session was not marked Completed or Cancelled)
        /// and sends a WhatsApp reminder/notification.
        /// Uses GYM_SCHEDULE_PROC action "010" — see SQL below.
        /// </summary>
        public static async Task NotifyIncompleteSchedulesAsync()
        {
            try
            {
                using (var db = new DBconnect())
                {
                    var req = new ScheduleRequestModel
                    {
                        p_action_type = "010"
                        // No need for p_schedule_date – SP uses GETDATE()
                    };
                    var res = db.ProcedureRead(req, "GYM_SCHEDULE_PROC");

                    if (res.ResultStatusCode != "1" || res.ResultDataTable.Rows.Count == 0)
                        return;

                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        try
                        {
                            string phone = GetColumnValue(row, "phone");
                            string memberName = GetColumnValue(row, "memberName");
                            string trainerName = GetColumnValue(row, "trainerName");
                            string scheduleDate = GetColumnValue(row, "scheduleDate");
                            string startTime = GetColumnValue(row, "starttime");
                            string endTime = GetColumnValue(row, "endtime");

                            if (string.IsNullOrWhiteSpace(phone)) continue;

                            await WhatsAppHelper.SendIncompleteScheduleNotificationAsync(
                                phone, memberName, scheduleDate, trainerName, startTime, endTime);
                        }
                        catch { /* Skip one bad row */ }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[ScheduleReminder] Error: {ex.Message}");
            }
        }
        // Sync wrapper for backward compatibility (calls async version)
        public static void NotifyIncompleteSchedules()
        {
            Task.Run(async () => await NotifyIncompleteSchedulesAsync()).Wait();
        }

        private static string GetColumnValue(DataRow row, string column)
        {
            return row.Table.Columns.Contains(column) ? row[column]?.ToString() : "";
        }
    }
}


using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    // ── Read model: maps SELECT result columns ────────────────────────
    public class TrainerTimeSlotModel
    {
        public int? trainerTimeslot_Id { get; set; }
        public int? trainer_Id { get; set; }
        public int? timeslot_Id { get; set; }
        public string day_of_week { get; set; }
        public bool? isActive { get; set; }
        public string starttime { get; set; }
        public string endtime { get; set; }
        public string trainerName { get; set; }
        public string schedule_type { get; set; }
        public string start_date { get; set; }
        public string end_date { get; set; }
        public string selected_days { get; set; }
        public string custom_starttime { get; set; }
        public string custom_endtime { get; set; }
    }

    // ── Write model: every property name MUST match an SP @param name exactly.
    //    DBConnect uses reflection: "@" + prop.Name → SqlParameter.
    //    Any extra property that has no matching @param in the SP causes SQL error.
    public class TrainerTimeSlotRequestModel : BaseRequestModel
    {
        // Matches @p_action_type (inherited from BaseRequestModel)

        // Matches @p_trainer_timeslot_id
        public int? p_trainer_timeslot_id { get; set; }
        // Matches @p_trainer_id
        public int? p_trainer_id { get; set; }
        // Matches @p_timeslot_id
        public int? p_timeslot_id { get; set; }
        // Matches @p_day_of_week  (now NVARCHAR(200) in SP — can hold comma-sep days)
        public string p_day_of_week { get; set; }
        // Matches @p_is_active
        public int? p_is_active { get; set; }
        // Matches @p_admin_id
        public int? p_admin_id { get; set; }
        // Matches @p_schedule_type
        public string p_schedule_type { get; set; }
        // Matches @p_start_date
        public string p_start_date { get; set; }
        // Matches @p_end_date
        public string p_end_date { get; set; }
        // Matches @p_selected_days
        public string p_selected_days { get; set; }
        // Matches @p_custom_starttime
        public string p_custom_starttime { get; set; }
        // Matches @p_custom_endtime
        public string p_custom_endtime { get; set; }
    }
}
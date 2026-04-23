using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class TrainerAttendanceModel
    {
        public int? trainerAttendanceId { get; set; }
        public int? trainerId { get; set; }
        public string trainerName { get; set; }
        public string checkInTime { get; set; }
        public string checkOutTime { get; set; }
    }

    public class TrainerAttendanceRequestModel : BaseRequestModel
    {
        public int? p_trainer_attendance_id { get; set; }
        public int? p_trainer_id { get; set; }
        public int? p_user_id { get; set; }
        public string p_check_in_time { get; set; }
        public string p_check_out_time { get; set; }
        public string p_date_from { get; set; }
        public string p_date_to { get; set; }
    }
}
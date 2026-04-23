using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class AttendanceModel
    {
        public int? attendanceId { get; set; }
        public int? memberId { get; set; }
        public int? rfId_Id { get; set; }
        public string check_in_time { get; set; }
        public string check_out_time { get; set; }
        public string memberName { get; set; }
    }

    public class AttendanceRequestModel : BaseRequestModel
    {
        public int? p_attendance_id { get; set; }
        public int? p_member_id { get; set; }
        public int? p_user_id { get; set; }
        public int? p_rfid_id { get; set; }
        public string p_check_in_time { get; set; }
        public string p_check_out_time { get; set; }
        public string p_date_from { get; set; }
        public string p_date_to { get; set; }
    }
}
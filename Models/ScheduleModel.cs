using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class ScheduleModel
    {
        public int? scheduleId { get; set; }
        public int? rfid_Id { get; set; }
        public int? memberId { get; set; }
        public int? trainerId { get; set; }
        public int? timeslotId { get; set; }
        public string scheduleDate { get; set; }
        public string status { get; set; }
        public string memberName { get; set; }
        public string trainerName { get; set; }
        public string starttime { get; set; }
        public string endtime { get; set; }
    }

    public class ScheduleRequestModel : BaseRequestModel
    {
        public int? p_schedule_id { get; set; }
        public int? p_rfid_id { get; set; }
        public int? p_member_id { get; set; }
        public int? p_trainer_id { get; set; }
        public int? p_timeslot_id { get; set; }
        public string p_schedule_date { get; set; }
        public string p_status { get; set; }
        public int? p_admin_id { get; set; }
        public string p_date_from { get; set; }
        public string p_date_to { get; set; }
        public string p_reason { get; set; }
    }
}
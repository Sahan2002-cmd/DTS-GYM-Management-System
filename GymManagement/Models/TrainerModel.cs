using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class TimeslotModel
    {
        public int? timeslot_Id { get; set; }
        public string starttime { get; set; }
        public string endtime { get; set; }
    }

    public class TimeSlotRequestModel : BaseRequestModel
    {
        public int? p_timeslot_id { get; set; }
        public string p_starttime { get; set; }
        public string p_endtime { get; set; }
        public int? p_admin_id { get; set; }
    }
}
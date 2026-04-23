using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class RfidTagModel
    {
        public int? rfId_Id { get; set; }
        public string issueDate { get; set; }
        public bool? isActive { get; set; }
        public string rfid_number { get; set; } //This for Physical ID number
        public int? deviceId { get; set; }
        public int? memberId { get; set; }
        public string is_status { get; set; }

    }

    public class RfidTagRequestModel : BaseRequestModel
    {
        public int? p_rfid_id { get; set; }
        public string p_issue_date { get; set; }
        public int? p_is_active { get; set; }
        public int? p_admin_id { get; set; }
        public string p_rfid_number { get; set; }
        public int? p_member_id { get; set; }  // *** NEW: for GetByMember
        public string p_is_status { get; set; }  // *** NEW: 'active'/'inactive'
    }
}

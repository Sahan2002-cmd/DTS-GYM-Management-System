using System;

namespace GymManagement.Models
{
    public class ComplaintModel
    {
        public int complaintId { get; set; }
        public int userId { get; set; }
        public string userFullName { get; set; } // for display
        public string type { get; set; } // 'person' or 'public'
        public int? targetUserId { get; set; } // for 'person'
        public string targetUserName { get; set; }
        public string message { get; set; }
        public int rating { get; set; } // 1-5
        public string status { get; set; } // pending, resolved
        public string created_date { get; set; }
    }

    public class ComplaintRequestModel : BaseRequestModel
    {
        public int p_complaintId { get; set; }
        public int p_userId { get; set; }
        public string p_type { get; set; }
        public int? p_targetUserId { get; set; }
        public string p_message { get; set; }
        public int p_rating { get; set; }
        public string p_status { get; set; }
        public int p_adminId { get; set; }
    }
}
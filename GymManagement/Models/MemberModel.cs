using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class MemberModel
    {
        public int? memberId { get; set; }
        public int? userId { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
        public string joinDate { get; set; }
        public string blood_group { get; set; }
        public decimal? height { get; set; }
        public decimal? weight { get; set; }
        public string fitness_goal { get; set; }
        public int? rfId_Id { get; set; }
        // joined from User
        public string email { get; set; }
        public string phone { get; set; }
        public string status { get; set; }
    }

    public class MemberRequestModel : BaseRequestModel
    {
        public int? p_member_id { get; set; }
        public int? p_user_id { get; set; }
        public string p_first_name { get; set; }
        public string p_last_name { get; set; }
        public string p_join_date { get; set; }
        public string p_blood_group { get; set; }
        public decimal? p_height { get; set; }
        public decimal? p_weight { get; set; }
        public string p_fitness_goal { get; set; }
        public int? p_rfid_id { get; set; }
        public int? p_admin_id { get; set; }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class TrainerModel
    {
        public int? trainerId { get; set; }
        public int? userId { get; set; }
        public int? experience_years { get; set; }
        public string bio { get; set; }
        public string qualifications { get; set; }
        public string date_of_birth { get; set; }
        public int? age { get; set; }

        // Joined from Users table
        public string username { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
        public string gender { get; set; }
        public string profile_image { get; set; }

        public string status { get; set; }
    }

    public class TrainerRequestModel : BaseRequestModel
    {
        public int? p_trainer_id { get; set; }
        public int? p_user_id { get; set; }
        public int? p_experience_years { get; set; }
        public string p_bio { get; set; }
        public string p_qualifications { get; set; }
        public string p_date_of_birth { get; set; }
        public int? p_admin_id { get; set; }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class NonEquipmentExerciseModel
    {
        public int? use_Id { get; set; }
        public int? scheduleId { get; set; }
        public int? exercise_Id { get; set; }
        public int? sets { get; set; }
        public int? reps { get; set; }
        public string sub_status { get; set; }
        public string exerciseName { get; set; }
        public string muscleGroup { get; set; }
        public string approval_status { get; set; }
    }

    public class NonEquipmentExerciseRequestModel : BaseRequestModel
    {
        public int? p_use_id { get; set; }
        public int? p_schedule_id { get; set; }
        public int? p_exercise_id { get; set; }
        public int? p_sets { get; set; }
        public int? p_reps { get; set; }
        public string p_sub_status { get; set; }
        public string p_approval_status { get; set; }
        public int? p_admin_id { get; set; }
    }
}
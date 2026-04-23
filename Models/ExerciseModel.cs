using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class ExerciseModel
    {
        public int? exerciseId { get; set; }
        public string ExerciseName { get; set; }
        public string MuscleGroup { get; set; }
        public string description { get; set; }
    }
    public class ExerciseRequestModel : BaseRequestModel
    {
        public int? p_exercise_id { get; set; }
        public string p_exercise_name { get; set; }
        public string p_muscle_group { get; set; }
        public string p_description { get; set; }
        public int? p_admin_id { get; set; }
    }
}
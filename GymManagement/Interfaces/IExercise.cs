using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GymManagement.Interfaces
{
    public interface IExercise
    {
        Response GetAll();
        Response GetById(int exerciseId);
        Response Add(ExerciseRequestModel req);
        Response Edit(ExerciseRequestModel req);
        Response Delete(int exerciseId, int adminId);
    }
}

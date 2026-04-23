using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface ITrainer
    {
        Response GetAllTrainers();
        Response GetTrainerById(int trainerId);
        Response GetTrainerByUserId(int userId);
        Response AddTrainer(TrainerRequestModel req);
        Response EditTrainer(TrainerRequestModel req);
        Response DeleteTrainer(int trainerId, int adminId);
        Response GetAllActiveTimeslots();
    }
}

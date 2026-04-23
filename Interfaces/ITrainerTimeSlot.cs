using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface ITrainerTimeSlot
    {
        Response GetAll();
        Response GetById(int trainerTimeslotId);
        Response GetByTrainer(int trainerId);
        Response Add(TrainerTimeSlotRequestModel req);
        Response ApproveOrReject(int trainerTimeslotId, int isActive, int adminId);
        Response Delete(int trainerTimeslotId, int adminId);
    }
}
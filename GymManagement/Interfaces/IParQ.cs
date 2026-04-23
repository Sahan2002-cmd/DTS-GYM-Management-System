using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface IParQ
    {
        Response GetAll();
        Response GetByUserId(int userId);
        Response GetByTrainerId(int trainerId);
        Response Save(ParQRequestModel req);
    }
}
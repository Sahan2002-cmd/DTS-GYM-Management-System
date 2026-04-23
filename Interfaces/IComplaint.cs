using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface IComplaint
    {
        Response GetAll();
        Response GetById(int complaintId);
        Response GetByUser(int userId);
        Response AddComplaint(ComplaintRequestModel req);
        Response UpdateStatus(int complaintId, string status, int adminId);
        Response AddRating(int complaintId, int rating);
    }
}
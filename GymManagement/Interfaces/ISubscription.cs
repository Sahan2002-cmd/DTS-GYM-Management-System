using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface ISubscription
    {
        Response GetAll();
        Response GetById(int subscriptionId);
        Response GetByMember(int memberId);
        Response Add(SubscriptionRequestModel req);
        Response Edit(SubscriptionRequestModel req);
        Response Deactivate(int subscriptionId, int adminId);
        Response GetActiveSubscriptions();
        // ADD:
        Response Activate(int subscriptionId, int adminId);
    }
}

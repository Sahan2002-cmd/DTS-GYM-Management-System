using System.Web.Mvc;
using System.Web.Http;
using Unity;
using Unity.WebApi;
using GymManagement.Interfaces;
using GymManagement.DataAccess;

namespace GymManagement
{
    public static class UnityConfig
    {
        public static void RegisterComponents()
        {
            var container = new UnityContainer();
            
            // Register DataAccess implementations
            container.RegisterType<IAttendance, DAAttendance>();
            container.RegisterType<IComplaint, DAComplain>();
            container.RegisterType<IDevice, DADevice>();
            container.RegisterType<IEquipment, DAEquipment>();
            container.RegisterType<IEquipmentAssignment, DAEquipmentAssignment>();
            container.RegisterType<IEquipmentUsageLog, DAEquipmentUsageLog>();
            container.RegisterType<IExercise, DAExercise>();
            container.RegisterType<IMember, DAMember>();
            container.RegisterType<INonEquipmentExercise, DANonEquipmentExercise>();
            container.RegisterType<IParQ, DAParQ>();
            container.RegisterType<IPayment, DAPayment>();
            container.RegisterType<IPlan, DAPlan>();
            container.RegisterType<IReport, DAReport>();
            container.RegisterType<IRfidTag, DARfidTag>();
            container.RegisterType<ISchedule, DASchedule>();
            container.RegisterType<ISubscription, DASubscription>();
            container.RegisterType<ITimeSlot, DATimeSlot>();
            container.RegisterType<ITrainer, DATrainer>();
            container.RegisterType<ITrainerAssignment, DATrainerAssignment>();
            container.RegisterType<ITrainerAttendance, DATrainerAttendance>();
            container.RegisterType<ITrainerTimeSlot, DATrainerTimeSlot>();
            container.RegisterType<IUser, DAUser>();
            
            // Set Web API resolver
            System.Web.Http.GlobalConfiguration.Configuration.DependencyResolver = new UnityDependencyResolver(container);
            
            // Set MVC resolver
            DependencyResolver.SetResolver(new Unity.Mvc5.UnityDependencyResolver(container));
        }
    }
}
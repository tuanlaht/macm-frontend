import axiosClient from './axiosClient';

const adminClubFeeAPI = {
    //membership api
    getListMembership: (semesterId) => {
        const url = `/admin/treasure/membership/${semesterId}`;
        return axiosClient.get(url);
    },

    updateMembership: (studentId) => {
        const url = `/admin/treasure/membership/update/${studentId}`;
        return axiosClient.put(url);
    },

    getSemester: () => {
        const url = '/semester/getTop3Semesters';
        return axiosClient.get(url);
    },

    getCurrentSemester: () => {
        const url = '/semester/currentsemester';
        return axiosClient.get(url);
    },

    getSemesterFee: (semesterName) => {
        const url = `/admin/treasure/membership/membershipinfo/${semesterName}`;
        return axiosClient.get(url);
    },

    updateMembershipFee: (semesterId, totalAmount) => {
        const url = `admin/treasure/membership/membershipinfo/${semesterId}`;
        return axiosClient.put(url, null, {
            params: {
                amount: totalAmount,
            },
        });
    },
    //event fee api
    getEventBySemester: (semesterId) => {
        const url = `/event/geteventsbysemester/${semesterId}`;
        return axiosClient.get(url);
    },

    getUserJoinEvent: (eventId) => {
        const url = `/event/headculture/getalluserevent/${eventId}`;
        return axiosClient.get(url);
    },

    updateUserPayment: (id) => {
        const url = `/event/treasurer/updateusereventpaymentstatus/${id}`;
        return axiosClient.put(url);
    },
};

export default adminClubFeeAPI;
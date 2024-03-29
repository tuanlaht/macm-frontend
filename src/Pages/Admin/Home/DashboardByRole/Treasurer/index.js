import { Fragment, useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import PeopleIcon from '@mui/icons-material/People';
import { Box } from '@mui/system';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import MemberChart from 'src/Pages/Admin/Home/Charts/Member';
import UpNext from 'src/Pages/Admin/Home/UpNext';
import Attendance from 'src/Pages/Admin/Home/Charts/Attendance';
import dashboardApi from 'src/api/dashboardApi';
import FeeReport from 'src/Pages/Admin/Home/Charts/Fee';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import semesterApi from 'src/api/semesterApi';
import LoadingProgress from 'src/Components/LoadingProgress';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import notificationApi from 'src/api/notificationApi';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import PaymentNotification from 'src/Pages/Home/PaymentNotification';
import adminFunAPi from 'src/api/adminFunAPi';

export const CustomPersentStatus = ({ persent }) => {
    let bgColor = '#ccf5e7';
    let color = '#0bce89';
    if (Number(persent) < 0) {
        bgColor = '#ffd5e1';
        color = '#ff3e6e';
    }
    return (
        <Box
            component="span"
            sx={{
                bgcolor: bgColor,
                color: color,
                padding: '2px 8px 2px 8px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.8rem',
            }}
        >
            {Number(persent) < 0 ? (
                <ArrowDownwardRoundedIcon sx={{ fontSize: '0.8em' }} />
            ) : (
                <ArrowUpwardRoundedIcon sx={{ fontSize: '0.8em' }} />
            )}{' '}
            {persent}%
        </Box>
    );
};
function TreasurerDashboard() {
    const [memberReport, setMemberReport] = useState([]);
    const [feeReport, setFeeReport] = useState([]);
    const [balanceInCurrentMonth, setBalanceInCurrentMonth] = useState([]);
    const [balanceInLastMonth, setBalanceInLastMonth] = useState([]);
    const [currentSemester, setCurrentSemester] = useState([]);
    const [openNotificationDialog, setOpenNotificationDialog] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState([]);
    const studentId = JSON.parse(localStorage.getItem('currentUser')).studentId;
    const [totalFund, setTotalFund] = useState([]);

    const currentMonth = new Date().getMonth() + 1;
    useEffect(() => {
        const fetchTotalFund = async () => {
            try {
                const response = await adminFunAPi.getClubFund();
                console.log('fetchTotalFund', response);
                setTotalFund(response.data[0].fundAmount);
            } catch (error) {
                console.log('failed when fetchTotalFund', error);
            }
        };
        fetchTotalFund();
    }, []);

    const fetchPaymentNotification = async (studentId) => {
        try {
            const response = await notificationApi.checkPaymentStatus(studentId);
            console.log('fetchPaymentNotification', response);
            setPaymentMessage(response.message);
        } catch (error) {
            console.log('failed when fetchPaymentNotification', error);
        }
    };
    const handleOpenNotificationDialog = () => {
        setOpenNotificationDialog(true);
    };
    const handleCloseNotificationDialog = () => {
        // setAlreadyVisited(false);
        localStorage.removeItem('toShowPopup');
        setOpenNotificationDialog(false);
    };
    const fetchFeeInCurrentSemester = async () => {
        try {
            const semester = await semesterApi.getCurrentSemester();

            console.log('Current Semester', semester.data);
            const fee = await dashboardApi.getFeeReportBySemester(semester.data[0].name);
            console.log('fee in currentmonth', fee.data);
            setFeeReport(fee.data);
        } catch (error) {
            console.log('Failed when fetch Current Semester', error);
        }
    };

    const fetchMemberReport = async () => {
        try {
            const response = await dashboardApi.getUserStatus();
            console.log('Member Report', response.data);
            let reverseList = response.data.sort((a, b) => b.id - a.id);
            // let filterByMonth = response.data.filter((item) => item.month === currentMonth);
            // setBalanceInCurrentMonth(filterByMonth);
            setMemberReport(reverseList);
        } catch (error) {
            console.log('Failed when fetch member report', error);
        }
    };
    // useEffect(() => {
    //     fetchFeeInCurrentSemester();
    //     fetchMemberReport();
    //     fetchPaymentNotification(studentId);
    //     // getPersentMemberSinceLastSemester();
    //     let visited = localStorage['toShowPopup'] !== 'true';
    //     if (!visited) {
    //         handleOpenNotificationDialog();
    //     }
    // }, [studentId]);
    // useEffect(() => {
    //     if (paymentMessage === 'Không có khoản nào phải đóng') {
    //         handleCloseNotificationDialog();
    //     }
    // }, [paymentMessage]);
    useEffect(() => {
        fetchFeeInCurrentSemester();
        fetchMemberReport();
        fetchPaymentNotification(studentId);
        let visited = localStorage['toShowPopup'] !== 'true';

        if (!visited) {
            handleOpenNotificationDialog();
        }
    }, [studentId]);

    useEffect(() => {
        if (paymentMessage === 'Không có khoản nào phải đóng') {
            handleCloseNotificationDialog();
        }
    }, [paymentMessage]);
    useEffect(() => {
        if (paymentMessage === 'Không có khoản nào phải đóng') {
            handleCloseNotificationDialog();
        }
    }, [paymentMessage]);

    // useEffect(() => {
    //     console.log(balanceInCurrentMonth);
    // }, [balanceInCurrentMonth]);

    // const getPersentMemberSinceLastSemester = () => {
    //     let memberPersent =
    //         memberReport[0] &&
    //         Math.floor((memberReport[0].totalNumberUserInSemester / memberReport[1].totalNumberUserInSemester) * 100);
    //     console.log(memberPersent);
    // };
    const gridContainer = {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
    };
    const gridItem = {
        margin: '8px',
        border: '1px solid red',
    };

    return (
        <Fragment>
            <Dialog
                open={openNotificationDialog}
                onClose={handleCloseNotificationDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Thông báo</DialogTitle>
                <DialogContent>
                    {/* <DialogContentText id="alert-dialog-description"></DialogContentText> */}
                    <PaymentNotification />
                </DialogContent>
                <DialogActions>
                    {/* <Button onClick={handleCloseNotificationDialog}>Disagree</Button> */}
                    <Button onClick={handleCloseNotificationDialog} autoFocus>
                        Thoát
                    </Button>
                </DialogActions>
            </Dialog>
            {memberReport[0] ? (
                <Fragment>
                    <Typography variant="h4" color="initial" sx={{ fontWeight: 500, mb: 2 }}>
                        Tổng Quan
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={4}>
                            <Paper elevation={2} sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="button" color="initial">
                                        Tổng tiền quỹ
                                    </Typography>
                                    <Typography variant="h5" color="initial" sx={{ fontWeight: 500, mb: 1 }}>
                                        {totalFund.toLocaleString()}
                                        {/* {balanceInCurrentMonth[0] && balanceInCurrentMonth[0].balance.toLocaleString()}{' '} */}{' '}
                                        VND
                                    </Typography>
                                    {balanceInLastMonth[0] && balanceInLastMonth[0].balance === 0 ? null : (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CustomPersentStatus
                                                persent={
                                                    feeReport[0] && feeReport[0].totalBalancePercent.toLocaleString()
                                                }
                                            />
                                            <Typography variant="caption" color="initial" sx={{ ml: 1 }}>
                                                so với tháng trước
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                <Avatar sx={{ bgcolor: '#16ce8e', width: 48, height: 48 }}>
                                    <AttachMoneyRoundedIcon sx={{ fontSize: '2rem' }} />
                                </Avatar>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={12} md={4}>
                            <Paper elevation={2} sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="button" color="initial">
                                        Tổng thu trong kỳ
                                    </Typography>
                                    <Typography variant="h5" color="initial" sx={{ fontWeight: 500, mb: 1 }}>
                                        {feeReport[0] && feeReport[0].totalIncome.toLocaleString()} VND
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CustomPersentStatus
                                            persent={feeReport[0] && feeReport[0].totalIncomePercent.toLocaleString()}
                                        />

                                        <Typography variant="caption" color="initial" sx={{ ml: 1 }}>
                                            so với tháng trước
                                        </Typography>
                                    </Box>
                                </Box>
                                <Avatar sx={{ bgcolor: '#35C0DE', width: 48, height: 48 }}>
                                    <AddBusinessIcon sx={{ fontSize: '2rem' }} />
                                </Avatar>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={12} md={4}>
                            <Paper elevation={2} sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="button" color="initial">
                                        Tổng chi trong kỳ
                                    </Typography>
                                    <Typography variant="h5" color="initial" sx={{ fontWeight: 500, mb: 1 }}>
                                        {feeReport[0] && feeReport[0].totalSpend.toLocaleString()} VND
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CustomPersentStatus
                                            persent={feeReport[0] && feeReport[0].totalSpendPercent.toLocaleString()}
                                        />
                                        <Typography variant="caption" color="initial" sx={{ ml: 1 }}>
                                            so với tháng trước
                                        </Typography>
                                    </Box>
                                </Box>
                                <Avatar sx={{ bgcolor: '#ff569b', width: 48, height: 48 }}>
                                    <MoneyOffIcon sx={{ fontSize: '2rem' }} />
                                </Avatar>
                            </Paper>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} md={9} order={{ xs: 2, md: 1 }}>
                            <Paper elevation={2} sx={{ padding: '16px' }}>
                                <FeeReport />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={3} order={{ xs: 1, md: 2 }}>
                            <Paper elevation={2} sx={{ padding: '16px' }}>
                                <UpNext isAdmin={true} />
                            </Paper>
                        </Grid>
                    </Grid>
                </Fragment>
            ) : (
                <LoadingProgress />
            )}
        </Fragment>
    );
}

export default TreasurerDashboard;

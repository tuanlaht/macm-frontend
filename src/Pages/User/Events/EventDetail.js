import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { useCallback, useState } from 'react';
import { useEffect } from 'react';
import { Fragment } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import eventApi from 'src/api/eventApi';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import RegisterEventDialog from './RegisterEventDialog';
import LoadingProgress from 'src/Components/LoadingProgress';
import ConfirmCancel from './ConfirmDialog';

function EventDetail() {
    let { id } = useParams();
    const [event, setEvent] = useState([]);
    const [eventJoined, setEventJoined] = useState([]);
    const [scheduleList, setScheduleList] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    let navigate = useNavigate();
    const now = new Date();
    const studentId = JSON.parse(localStorage.getItem('currentUser')).studentId;

    const getListEvents = async () => {
        try {
            // const params = { name: 'Đi chùa' };
            const response = await eventApi.getAll();
            // setEvent(response.data);
            let selectedEvent = response.data.filter((item) => item.id === parseInt(id, 10));
            setEvent(selectedEvent);
            console.log(event);
        } catch (error) {
            console.log('Lấy dữ liệu thất bại', error);
        }
    };
    const getListEventJoined = async (studentId) => {
        try {
            const response = await eventApi.getAllEventByStudentId(studentId);
            console.log(`List event by student Id`, response);
            setEventJoined(response.data);
        } catch (error) {
            console.log('Lấy dữ liệu thất bại', error);
        }
    };
    const fetchEventSchedule = async (params) => {
        try {
            const response = await eventApi.getEventScheduleByEvent(params);
            console.log('Thanh cong roi: ', response);
            setScheduleList(response.data);
        } catch (error) {
            console.log('That bai roi huhu ', error);
        }
    };
    useEffect(() => {
        fetchEventSchedule(id);
        getListEventJoined(studentId);
    }, [id, studentId]);

    const checkEventJoined = () => {
        if (eventJoined.filter((event) => event.id === id)) {
            return true;
        } else {
            return false;
        }
    };
    const handleRegisterEventDeadline = () => {
        if (event[0]) {
            if (new Date(event[0].registrationMemberDeadline) > now) {
                return true;
            } else {
                return false;
            }
        }
    };
    // const handleRegisterCommitteeEventDeadline = () => {
    //     if (new Date(event[0].registrationOrganizingCommitteeDeadline) > now) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // };
    const scheduleData = scheduleList.map((item) => {
        const container = {};
        container['id'] = item.id;
        container['date'] = item.date;
        container['title'] = item.event.name + ' - ' + item.startTime.slice(0, 5) + ' - ' + item.finishTime.slice(0, 5);
        container['display'] = 'background';
        container['backgroundColor'] = '#5ba8f5';

        return container;
    });
    useEffect(() => {
        getListEvents();
        console.log(event);
        window.scrollTo({ behavior: 'smooth', top: '0px' });
    }, []);

    if (!scheduleList[0]) {
        return <LoadingProgress />;
    }

    return (
        <Fragment>
            {event[0] && (
                <RegisterEventDialog
                    isOpen={openDialog}
                    handleClose={() => {
                        setOpenDialog(false);
                    }}
                    data={event[0]}
                />
            )}
            <ConfirmCancel
                isOpen={openConfirmDialog}
                handleClose={() => {
                    setOpenConfirmDialog(false);
                }}
            />
            {scheduleList[0] && (
                <Fragment key={scheduleList[0].id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                        <Typography variant="h4" gutterBottom component="div" sx={{ fontWeight: 500, marginBottom: 2 }}>
                            Thông tin sự kiện "{scheduleList[0].event.name}"
                        </Typography>
                        <Box>
                            {new Date(scheduleList[0].date) > new Date() ? (
                                !checkEventJoined() ? (
                                    <Fragment>
                                        <Button
                                            variant="outlined"
                                            onClick={() => setOpenDialog(true)}
                                            {...(handleRegisterEventDeadline()
                                                ? { disabled: false }
                                                : { disabled: true })}
                                        >
                                            {handleRegisterEventDeadline() ? 'Đăng ký tham gia' : 'Hết hạn đăng ký'}
                                        </Button>
                                    </Fragment>
                                ) : (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => setOpenConfirmDialog(true)}
                                        {...(handleRegisterEventDeadline() ? { disabled: false } : { disabled: true })}
                                    >
                                        Hủy đăng ký tham gia
                                    </Button>
                                )
                            ) : (
                                ''
                            )}
                        </Box>
                    </Box>
                    <Grid container columns={12} sx={{ mt: 2 }}>
                        <Grid item xs={5}>
                            <Box sx={{ marginTop: '16px' }}>
                                <div>
                                    <Typography variant="h6">
                                        <strong>Dự kiến số tiền mỗi người phải đóng: </strong>
                                        {scheduleList[0].event.amountPerRegisterEstimated.toLocaleString('en-US')} VND
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="h6">
                                        <strong>Số người ban tổ chức: </strong>
                                        {scheduleList[0].event.maxQuantityComitee}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="h6">
                                        <strong>Nội dung: </strong>
                                        <p>{scheduleList[0].event.description}</p>
                                    </Typography>
                                </div>
                                <Box>
                                    {new Date(scheduleList[0].date) > new Date() ? (
                                        <Fragment>
                                            <Button variant="outlined" component={Link} to={`edit`}>
                                                Đăng ký tham gia
                                            </Button>
                                        </Fragment>
                                    ) : (
                                        ''
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={7} sx={{ minHeight: '755px' }}>
                            <FullCalendar
                                // initialDate={new Date('2022-09-01')}
                                initialDate={scheduleData[0] && new Date(scheduleData[0].date)}
                                locale="vie"
                                height="60%"
                                plugins={[dayGridPlugin, interactionPlugin]}
                                defaultView="dayGridMonth"
                                events={scheduleData}
                                weekends={true}
                                headerToolbar={{
                                    left: 'title',
                                    center: 'dayGridMonth,dayGridWeek',
                                    right: 'prev next today',
                                    // right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                                }}
                            />
                        </Grid>
                    </Grid>
                </Fragment>
            )}

            {/* ); */}
            {/* })} */}
            {/* <MemberEvent /> */}
        </Fragment>
    );
}

export default EventDetail;

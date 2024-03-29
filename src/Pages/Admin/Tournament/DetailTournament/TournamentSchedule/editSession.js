import {
    Box,
    ButtonGroup,
    Button,
    Typography,
    TextField,
    Grid,
    Snackbar,
    Alert,
    IconButton,
    Tooltip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker, LocalizationProvider, StaticDatePicker, TimePicker } from '@mui/x-date-pickers';
import { useEffect, useState } from 'react';
import vi from 'date-fns/locale/vi';
import { Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from '@mui/material';
import trainingSchedule from 'src/api/trainingScheduleApi';
import moment from 'moment';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import eventApi from 'src/api/eventApi';
import { useSnackbar } from 'notistack';
import { Title } from '@mui/icons-material';
import adminTournament from 'src/api/adminTournamentAPI';

function EditSession({ title, children, isOpen, handleClose, onSucess, date, scheduleData }) {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const currentDate = new Date();
    const { scheduleId } = useParams();

    const [open, setOpen] = useState(false);
    // const { scheduleId } = useParams();
    const [scheduleList, setScheduleList] = useState(date);

    const [value, setValue] = useState(scheduleList);
    const [selectedDate, setSelectedDate] = useState();
    const [dateValue, setDateValue] = useState();

    const schema = Yup.object().shape({
        // date: Yup.string().nullable().required('Vui lòng không để trống trường này'),
        startTime: Yup.date()
            .nullable()
            .required('Vui lòng không để trống trường này')
            .typeError('Vui lòng nhập đúng định dạng thời gian HH:mm'),
        finishTime: Yup.date()
            // .min(Yup.ref('startTime'), ({ min }) => `Thời gian kết thúc không được sớm hơn thời gian bắt đầu`)
            .typeError('Vui lòng nhập đúng định dạng thời gian HH:mm')
            .test('deadline_test', 'Thời gian kết thúc không được sớm hơn thời gian bắt đầu', function (value) {
                const { startTime } = this.parent;
                return value.getTime() > startTime.getTime();
            })
            .required('Vui lòng không để trống trường này'),
    });

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setOpen(false);
    };

    const handleConfirmDialog = async () => {
        setOpen(false);
        await adminTournament.deleteTournamentSession(scheduleList[0].id).then((res) => {
            if (res.data.length != 0) {
                let variant = 'success';
                enqueueSnackbar(res.message, { variant });
                handleClose();
            } else {
                let variant = 'error';
                enqueueSnackbar(res.message, { variant });
                handleClose();
            }
        });
        onSucess && onSucess(true);
        handleCloseConfirmDialog();
        handleClose();
    };
    const {
        control,
        handleSubmit,
        register,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
        defaultValues: {},
    });

    const onSubmit = async (data) => {
        const formatData = {
            id: scheduleList[0].id,
            date: scheduleList[0].date,
            startTime: moment(data.startTime).format('HH:mm'),
            finishTime: moment(data.finishTime).format('HH:mm'),
        };
        await adminTournament.updateTournamentSession(formatData.id, formatData).then((res) => {
            if (res.data.length != 0) {
                let variant = 'success';
                enqueueSnackbar('Cập nhật thời gian giải đấu thành công', { variant });
                onSucess && onSucess(true);
                handleClose();
                handleClose();
            } else {
                let variant = 'error';
                enqueueSnackbar(res.message, { variant });
                handleClose();
            }
        });
        console.log('form submit', formatData);
    };
    // const onSubmit = (data) => {
    //     console.log('form submit', data);
    // };
    return (
        <Box>
            <Dialog
                open={open}
                onClose={handleCloseConfirmDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{'Xác nhận xóa ?'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Bạn muốn xóa buổi đấu ngày {moment(scheduleList[0].date).format('DD/MM/yyyy')} ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog}>Hủy</Button>
                    <Button onClick={handleConfirmDialog} autoFocus>
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                fullWidth
                maxWidth="xs"
                // keepMounted
                open={!!isOpen}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle
                    id="alert-dialog-title"
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {title}
                    {/* <Tooltip title="Xóa lịch tập">
                        <IconButton aria-label="delete" onClick={handleClickOpen}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip> */}
                </DialogTitle>
                <DialogContent>
                    {/* <DialogContentText id="alert-dialog-description">{facilityId}</DialogContentText> */}
                    <Box
                        component="form"
                        noValidate
                        autoComplete="off"
                        sx={
                            {
                                // '& .MuiTextField-root': { mt: 0 },
                            }
                        }
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                                <Box
                                    component="form"
                                    noValidate
                                    // onSubmit={}
                                    sx={{ width: '100%', mt: 5 }}
                                >
                                    {scheduleList.map((item) => {
                                        return (
                                            <Grid container spacing={1} columns={12} key={item.id}>
                                                <Grid item sm={12}>
                                                    <TextField
                                                        disabled
                                                        id="outlined-disabled"
                                                        label="Ngày tháng"
                                                        defaultValue={moment(item.date).format('DD/MM/yyyy')}
                                                        fullWidth
                                                        {...register('date')}
                                                        error={errors.date ? true : false}
                                                        helperText={errors.date?.message}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={12}>
                                                    <Controller
                                                        required
                                                        name="startTime"
                                                        control={control}
                                                        defaultValue={new Date(`2022-11-12T${item.startTime}`)}
                                                        render={({
                                                            field: { onChange, value },
                                                            fieldState: { error, invalid },
                                                        }) => (
                                                            <TimePicker
                                                                label="Thời gian bắt đầu"
                                                                ampm={false}
                                                                value={value}
                                                                onChange={(value) => onChange(value)}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        required
                                                                        id="outlined-disabled"
                                                                        error={invalid}
                                                                        helperText={invalid ? error.message : null}
                                                                        // id="startDate"
                                                                        variant="outlined"
                                                                        margin="dense"
                                                                        fullWidth
                                                                    />
                                                                )}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={12} sx={{ mb: 2 }}>
                                                    <Controller
                                                        required
                                                        name="finishTime"
                                                        control={control}
                                                        defaultValue={new Date(`2022-11-12T${item.finishTime}`)}
                                                        render={({
                                                            field: { onChange, value },
                                                            fieldState: { error, invalid },
                                                        }) => (
                                                            <TimePicker
                                                                label="Thời gian kết thúc"
                                                                ampm={false}
                                                                value={value}
                                                                onChange={(value) => onChange(value)}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        required
                                                                        id="outlined-disabled"
                                                                        error={invalid}
                                                                        helperText={invalid ? error.message : null}
                                                                        // id="startDate"
                                                                        variant="outlined"
                                                                        margin="dense"
                                                                        fullWidth
                                                                    />
                                                                )}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                            </Grid>
                                        );
                                    })}
                                </Box>
                            </LocalizationProvider>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleClickOpen}
                        disabled={scheduleData.length == 1}
                    >
                        Xóa lịch
                    </Button>
                    <Box>
                        <Button ariant="outlined" onClick={handleClose} sx={{ mr: 1 }}>
                            Hủy
                        </Button>
                        <Button variant="contained" onClick={handleSubmit(onSubmit)} autoFocus>
                            Xác nhận
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default EditSession;

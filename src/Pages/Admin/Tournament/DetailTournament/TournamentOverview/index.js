import React, { Fragment, useState } from 'react';
import {
    Box,
    Button,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import { Edit } from '@mui/icons-material';
import UpdateTournamentOverview from './UpdateTournamentOverview';
import { hover } from '@testing-library/user-event/dist/hover';
import moment from 'moment';

function TournamentOverview({
    tournament,
    onUpdateTournament,
    value,
    index,
    startTime,
    isUpdate,
    onChangeTab,
    tournamentStage,
    schedule,
    roleInTournament,
}) {
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const user = JSON.parse(localStorage.getItem('currentUser'));

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        // [`&.${tableCellClasses.head}`]: {
        //     backgroundColor: theme.palette.common.black,
        //     color: theme.palette.common.white,
        // },
        // [`&.${tableCellClasses.body}`]: {
        //     fontSize: 14,
        // },
    }));

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        },
        '&:hover': {
            backgroundColor: '#57a6f4 !important',
            cursor: 'pointer',
        },
    }));

    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            sx={{ p: 1 }}
        >
            {tournament && (
                <Fragment>
                    <Grid container columns={12} sx={{ width: '100% ', m: 0 }} spacing={2}>
                        <Grid item xs={12}>
                            {user.role.name === 'ROLE_HeadClub' ||
                            user.role.name === 'ROLE_HeadTechnique' ||
                            user.role.name === 'ROLE_ViceHeadTechnique' ||
                            user.role.name === 'ROLE_ViceHeadClub'
                                ? tournamentStage === 0 && (
                                      <Button
                                          variant="outlined"
                                          startIcon={<Edit />}
                                          sx={{ float: 'right' }}
                                          onClick={() => setOpenEditDialog(true)}
                                          disabled={tournamentStage !== 0}
                                      >
                                          Chỉnh sửa
                                      </Button>
                                  )
                                : null}

                            {openEditDialog && (
                                <UpdateTournamentOverview
                                    // DialogOpen={true}
                                    data={tournament}
                                    title="Cập nhật thông tin giải đấu"
                                    isOpen={openEditDialog}
                                    handleClose={() => {
                                        setOpenEditDialog(false);
                                        // reload();
                                    }}
                                    onSuccess={(newItem) => {
                                        onUpdateTournament(newItem);
                                        setOpenEditDialog(false);
                                    }}
                                    startTime={startTime}
                                />
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <TableContainer>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Nội dung</TableCell>
                                            <TableCell>Vai trò</TableCell>
                                            <TableCell align="left">Chi phí</TableCell>
                                            <TableCell align="left">Thời gian</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow
                                            sx={{
                                                '&:last-child td, &:last-child th': { border: 0 },
                                                verticalAlign: 'baseline',
                                            }}
                                        >
                                            <TableCell component="th" scope="row">
                                                <Typography variant="body1" sx={{}}>
                                                    {tournament.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="left">
                                                <ul>
                                                    {roleInTournament.map((role) => {
                                                        return (
                                                            <li key={role.id}>
                                                                <strong>{role.name}</strong>:{' '}
                                                                {role.maxQuantity - role.availableQuantity}/
                                                                {role.maxQuantity} người
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </TableCell>
                                            <TableCell align="left">
                                                <ul>
                                                    <li>
                                                        {!tournament.totalAmountActual ? (
                                                            <>
                                                                <strong>Tổng số tiền dự kiến: </strong>
                                                                {tournament.totalAmountEstimate.toLocaleString()} VND
                                                            </>
                                                        ) : (
                                                            <>
                                                                <strong>Tổng số tiền thực tế: </strong>
                                                                {tournament.totalAmount.toLocaleString()} VND
                                                            </>
                                                        )}
                                                    </li>
                                                    <li>
                                                        <strong>Số tiền tài trợ từ CLB: </strong>
                                                        {tournament.totalAmountFromClubActual > 0
                                                            ? tournament.totalAmountFromClubActual.toLocaleString()
                                                            : tournament.totalAmountFromClubEstimate.toLocaleString()}{' '}
                                                        VND
                                                    </li>
                                                    <li>
                                                        <>
                                                            <strong>
                                                                Dự kiến số tiền mỗi vận động viên cần phải đóng:{' '}
                                                            </strong>
                                                            {tournament.feePlayerPay.toLocaleString()} VND
                                                        </>
                                                        <br />
                                                        <>
                                                            <strong>
                                                                Số tiền mỗi người ban tổ chức cần phải đóng:{' '}
                                                            </strong>
                                                            {tournament.feeOrganizingCommiteePay.toLocaleString()} VND
                                                        </>
                                                    </li>
                                                </ul>
                                            </TableCell>
                                            <TableCell align="left">
                                                <ul>
                                                    <li>
                                                        <strong>Thời gian bắt đầu: </strong>
                                                        <br />
                                                        {schedule[0].startTime.slice(0, 5)} -{' '}
                                                        {moment(schedule[0].date).format('DD/MM/yyyy')}
                                                    </li>
                                                    <li>
                                                        <strong>Thời gian kết thúc: </strong>
                                                        <br />
                                                        {schedule[schedule.length - 1].finishTime.slice(0, 5)} -{' '}
                                                        {moment(schedule[schedule.length - 1].date).format(
                                                            'DD/MM/yyyy',
                                                        )}
                                                    </li>
                                                    <li>
                                                        <strong>Deadline đăng ký tham gia: </strong>
                                                        <br />
                                                        {moment(tournament.registrationPlayerDeadline).format(
                                                            'HH:mm - DD/MM/yyyy',
                                                        )}
                                                    </li>
                                                    {tournament.registrationOrganizingCommitteeDeadline ===
                                                    null ? null : (
                                                        <li>
                                                            <strong>Deadline đăng ký BTC: </strong>
                                                            <br />
                                                            {moment(
                                                                tournament.registrationOrganizingCommitteeDeadline,
                                                            ).format('HH:mm - DD/MM/yyyy')}
                                                        </li>
                                                    )}
                                                </ul>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                        {/* <Grid item xs={7}>
                            <Typography variant="body1" sx={{ p: 2, m: 1 }}>
                                <strong>Nội dung: </strong>
                                {tournament.description}
                            </Typography>
                            <Typography variant="body1" sx={{ p: 2, m: 1 }}>
                                <strong>Hạng mục thi đấu:</strong>
                            </Typography>
                        </Grid> */}

                        <Grid container columns={12} sx={{ mb: 2, ml: -4, mt: 0 }} spacing={6}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="body1">
                                    <strong>Thi đấu đối kháng </strong>
                                </Typography>
                                <Paper elevation={3}>
                                    {tournament.competitiveTypes.length > 0 && (
                                        <TableContainer sx={{ maxHeight: 440 }}>
                                            <Table stickyHeader aria-label="sticky table">
                                                <TableHead>
                                                    <TableRow>
                                                        <StyledTableCell align="center">Giới tính</StyledTableCell>
                                                        <StyledTableCell align="center">Hạng cân</StyledTableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {tournament.competitiveTypes.map((data) => (
                                                        <StyledTableRow
                                                            key={data.id}
                                                            onClick={(e) => {
                                                                onChangeTab && onChangeTab(5, 0, data.id);
                                                            }}
                                                        >
                                                            <StyledTableCell align="center">
                                                                {data.gender ? 'Nam' : 'Nữ'}
                                                            </StyledTableCell>
                                                            <StyledTableCell align="center">
                                                                {data.weightMin} - {data.weightMax} Kg
                                                            </StyledTableCell>
                                                        </StyledTableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <Typography variant="body1">
                                    <strong>Thi đấu biểu diễn </strong>
                                </Typography>
                                <Paper elevation={3}>
                                    {tournament.exhibitionTypes.length > 0 && (
                                        <TableContainer sx={{ maxHeight: 440 }}>
                                            <Table aria-label="sticky table">
                                                <TableHead>
                                                    <TableRow>
                                                        <StyledTableCell align="center">
                                                            Nội dung thi đấu
                                                        </StyledTableCell>
                                                        <StyledTableCell align="center">Số lượng nữ</StyledTableCell>
                                                        <StyledTableCell align="center">Số lượng nam</StyledTableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {tournament.exhibitionTypes.map((data) => (
                                                        <StyledTableRow
                                                            key={data.id}
                                                            onClick={(e) => {
                                                                onChangeTab && onChangeTab(5, 1, data.id);
                                                            }}
                                                        >
                                                            <StyledTableCell align="center">
                                                                {data.name}
                                                            </StyledTableCell>
                                                            <StyledTableCell align="center">
                                                                {data.numberFemale}
                                                            </StyledTableCell>
                                                            <StyledTableCell align="center">
                                                                {data.numberMale}
                                                            </StyledTableCell>
                                                        </StyledTableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Fragment>
            )}
        </Box>
    );
}
export default TournamentOverview;

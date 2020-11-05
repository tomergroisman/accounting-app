import React from 'react';
import { useRouter } from 'next/router'
import DefaultErrorPage from 'next/error';
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import auth0 from '../../lib/auth0';
import { formaDateToShow } from '../../helpers/functions';
import { incomeFetcher } from '../../helpers/fetchers'
import { useStyles } from '../../styles/pages/showStyles';

export default function ShowIncome(props) {
    const income = JSON.parse(props.income);
    const classes = useStyles(props);
    const router = useRouter();

    // Render
    if (!income) return <DefaultErrorPage statusCode={404} />
    
    const sumBeforeVat = income.total / (1 + income.vat / 100);
    return (
        <div className={classes.root}>
            <Container className={classes.container} maxWidth='md'>
                <Grid container spacing={3}>
                    <Grid item md={3}>
                        <p><strong>לקוח:</strong> {income.customer}</p>
                    </Grid>
                    <Grid item md={6}></Grid>
                    <Grid item md={3}>
                        <p><strong>תאריך:</strong> {formaDateToShow(income.date)}</p>
                    </Grid>
                    <Grid item md={12}>
                        <TableContainer className={classes.tableContainer}>
                            <Table>
                                <TableHead>
                                    <TableRow className={classes.tableHead}>
                                        <TableCell>#</TableCell>
                                        <TableCell>פירוט</TableCell>
                                        <TableCell>מחיר ליחידה</TableCell>
                                        <TableCell>כמות</TableCell>
                                        <TableCell>סה"כ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    { income.items.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{i + 1}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell>{item.price_per_unit}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.sum}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell rowSpan={5} className={classes.noBottomCell}/>
                                        <TableCell rowSpan={5} className={classes.noBottomCell}/>
                                        <TableCell colSpan={2}>סה"כ לפני מע"מ</TableCell>
                                        <TableCell>{sumBeforeVat}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>מע"מ</TableCell>
                                        <TableCell>{income.vat}%</TableCell>
                                        <TableCell>{sumBeforeVat * (income.vat / 100)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={classes.noBottomCell} colSpan={2}>סה"כ כולל מע"מ</TableCell>
                                        <TableCell className={classes.noBottomCell}>{income.total}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={classes.seperatorCell} colSpan={3}></TableCell>
                                    </TableRow>
                                    <TableRow >
                                        <TableCell className={classes.noBottomCell} colSpan={2}>שיטת תשלום</TableCell>
                                        <TableCell className={classes.noBottomCell}>{income.payment_method}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
                <div className={classes.metadata}>
                    <p><strong>קטגוריה:</strong> {income.category}</p>
                    <p><strong>אסמכתא:</strong> {income.reference}</p>
                    <p><strong>הערות:</strong> {income.comments}</p>
                </div>

                <div className={classes.buttonConteiner}>
                    <Button variant="contained" size="large" color="primary">הפק חשבונית</Button>
                    <Button variant="contained" size="large" color="primary">שלח במייל</Button>
                    <Button onClick={() => router.back()} variant="contained" size="large" color="primary">חזור</Button>
                </div>
            </Container>
        </div>
    )
}

export async function getServerSideProps(ctx) {
    const session = await auth0.getSession(ctx.req);
    return {
        props: {
            income: JSON.stringify(await incomeFetcher(ctx, session))
        }
    }
}
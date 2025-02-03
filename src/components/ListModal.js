import { Button } from '@mui/material';
import {
    createTheme, StyledEngineProvider, ThemeProvider
} from '@mui/material/styles';
import MaterialTable from 'material-table';
import React from 'react';
import { auth } from '../firebase/firebase.js';
import { StyledSquareButton } from '../theme/MealPlannerTheme';

class ListModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: auth.currentUser,
            newSelected: this.props.selectedMeals ? this.props.selectedMeals : []
        };
    }

    setSelectedMeals = (rowData) => {
        this.setState({ newSelected: rowData });
    }

    handleModalClose = (modalForClose) => {
        this.setState({
            [modalForClose]: false,
        });
    }

    render() {
        const { db } = this.props;
        const { newSelected } = this.state;
        const defaultMaterialTheme = createTheme();
        let mealsDbRef = db.ref(`users/${this.state.user.uid}/meals`);
        let mealStateIds = newSelected.map((item) => { return item.mealId ? item.mealId : item });
        let tableData = [];

        mealsDbRef.on('child_added', function (snapshot) {
            tableData.push({
                mealId: snapshot.key,
                mealTitle: snapshot.val().mealTitle,
                tableData: mealStateIds.includes(snapshot.key) ? { checked: true } : { checked: false }
            });
        })

        return (
            <div>
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={defaultMaterialTheme}>
                        <MaterialTable
                            title="Select Meals"
                            columns={[
                                { title: 'Name', field: 'mealTitle' },
                            ]}
                            data={tableData}
                            options={{
                                searching: true,
                                selection: true,
                                paging: false,
                                maxBodyHeight: '400'
                            }}
                            onSelectionChange={(rows) => this.setSelectedMeals(rows)}
                        />
                    </ThemeProvider>
                </StyledEngineProvider>

                < div style={{
                    position: 'absolute', right: 0, bottom: 0, margin: '15px'
                }}>
                    <Button style={{ marginRight: '5px' }} onClick={() => this.props.closeCallback()}>Close</Button>
                    <StyledSquareButton
                        onClick={() => this.props.confirmCallback(this.state.newSelected)}>Save</StyledSquareButton>
                </div>
            </div>
        );
    }
}


export default ListModal;
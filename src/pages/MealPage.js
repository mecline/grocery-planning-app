import { Dialog, IconButton, Typography, Chip, Box, useMediaQuery, useTheme, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import MaterialTable from 'material-table';
import React from 'react';
import MealModal from '../components/MealModal';
import { auth, firebaseDb } from '../firebase/firebase.js';
import { ThemeProvider, createTheme, Container } from '@mui/material';
import { StyledAddBox, textColor, backgroundColor } from '../theme/MealPlannerTheme';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const MealPageWrapper = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    return <MealPage isMobile={isMobile} />;
};

class MealPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: auth.currentUser,
            mealId: '',
            mealTitle: '',
            newMealTitle: '',
            ingredients: [],
            testList: null,
            isEditing: false,
            deleteConfirmOpen: false,
            mealToDelete: null
        };
    }

    componentDidMount() {
        firebaseDb.database().ref().orderByChild(`users/${this.state.user.uid}`).on('value', snap => {
            this.setState({
                testList: snap
            });
        });
    }

    setNewMealTitle = (newMealTitle) => {
        this.setState({ newMealTitle: newMealTitle });
    }

    handleWriteMealData = (mealTitle, ingredients, mealId) => {
        let uid = this.state.user.uid;
        if (!mealId) {
            firebaseDb.database().ref(`users/${uid}/meals`).push({
                mealTitle: mealTitle,
                ingredients: ingredients
            })
        }
        else if (mealId) {
            firebaseDb.database().ref(`users/${uid}/meals/${mealId}`).update({
                mealTitle: mealTitle,
                ingredients: ingredients
            })
        }
        this.setState({ mealModal: false });
    }

    handleMealModal = () => {
        this.setState({ mealModal: true });
    }

    handleModalClose = (modalForClose) => {
        this.setState({
            [modalForClose]: false,
            isEditing: false,
            mealId: '',
            mealTitle: '',
            ingredients: []
        });
    }

    openDeleteConfirmation = (rowData) => {
        this.setState({
            deleteConfirmOpen: true,
            mealToDelete: rowData
        });
    }

    closeDeleteConfirmation = () => {
        this.setState({
            deleteConfirmOpen: false,
            mealToDelete: null
        });
    }

    handleDeleteMeal = () => {
        const { mealToDelete } = this.state;
        if (!mealToDelete) return;

        let selectedMealIds = [];
        firebaseDb.database().ref(`users/${this.state.user.uid}/meals/${mealToDelete.mealId}`).remove();

        firebaseDb.database().ref(`users/${this.state.user.uid}/selectedMeals`).on('child_added', (snap) => {
            let selectedMeal = snap.val();
            if (selectedMeal !== mealToDelete.mealId) {
                selectedMealIds.push(selectedMeal);
            }
        })

        firebaseDb.database().ref(`users/${this.state.user.uid}`).update({
            selectedMeals: selectedMealIds
        });

        this.closeDeleteConfirmation();
    }

    handleEditMeal = (rowData) => {
        this.setState({
            isEditing: true,
            mealId: rowData.mealId,
            mealTitle: rowData.mealTitle,
            ingredients: rowData.ingredients,
            mealModal: true
        });
    }

    renderIngredientChips = (rowData, db) => {
        const { isMobile } = this.props;
        
        if (!rowData.ingredients || rowData.ingredients.length === 0) {
            return <span>No ingredients</span>;
        }

        return (
            <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 0.5, 
                maxHeight: isMobile ? '100px' : '150px',
                overflowY: 'auto'
            }}>
                {rowData.ingredients.map((ingredient, index) => (
                    <Chip
                        key={index}
                        label={
                            <span>
                                {ingredient.quantity > 1 && 
                                    <span style={{ marginRight: '4px' }}>
                                        ({ingredient.quantity})
                                    </span>
                                }
                                {ingredient.ingredientName}
                            </span>
                        }
                        size={isMobile ? "small" : "medium"}
                        sx={{
                            backgroundColor: backgroundColor,
                            color: textColor,
                            margin: '2px',
                            maxWidth: isMobile ? '120px' : '150px',
                            '& .MuiChip-label': {
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                width: 'fit-content',
                                textOverflow: 'initial',
                                fontSize: isMobile ? '12px' : '14px'
                            }
                        }}
                    />
                ))}
            </Box>
        );
    }

    getQuantityState = (ingredients) => {
        this.setState({ ingredients: ingredients });
    }

    render() {
        const defaultMaterialTheme = createTheme();
        const db = firebaseDb.database();
        let mealsDbRef = db.ref(`users/${this.state.user.uid}/meals`);
        let tableData = [];
        const { isMobile } = this.props;
        const { deleteConfirmOpen, mealToDelete } = this.state;

        mealsDbRef.on('child_added', function (snapshot) {
            tableData.push({
                mealId: snapshot.key,
                mealTitle: snapshot.val().mealTitle,
                ingredients: snapshot.val().ingredients
            });
        })

        return (
            <Box sx={{ 
                p: isMobile ? 2 : 4,
                pt: isMobile ? 2 : 4,
                pb: isMobile ? 6 : 4, // Extra bottom padding on mobile for navigation
                minHeight: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 140px)',
                boxSizing: 'border-box',
                overflowX: 'hidden'
            }}>
                <Container sx={{ 
                    backgroundColor: 'white', 
                    borderRadius: '10px', 
                    p: isMobile ? 2 : 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mb: 2
                    }}>
                        <Typography 
                            variant={isMobile ? "h6" : "h5"} 
                            sx={{ 
                                color: textColor,
                                fontWeight: 'medium',
                                mr: 2
                            }}
                        >
                            Meals
                        </Typography>
                        <IconButton 
                            onClick={() => this.handleMealModal()} 
                            size={isMobile ? "medium" : "large"}
                        >
                            <StyledAddBox sx={{ color: textColor }} />
                        </IconButton>
                        <Typography 
                            variant={isMobile ? "body2" : "body1"}
                            sx={{ color: textColor }}
                        >
                            Add Meal
                        </Typography>
                    </Box>
                    
                    <Box sx={{ 
                        flex: 1,
                        overflowY: 'auto',
                        '& .MuiPaper-root': {
                            boxShadow: 'none'
                        }
                    }}>
                        <ThemeProvider theme={defaultMaterialTheme}>
                            <MaterialTable
                                title={null}
                                columns={[
                                    { 
                                        title: 'Meal Title', 
                                        field: 'mealTitle',
                                        width: isMobile ? '40%' : '25%',
                                        cellStyle: {
                                            fontSize: isMobile ? '14px' : '16px',
                                            padding: isMobile ? '8px 4px' : '16px 8px'
                                        }
                                    },
                                    {
                                        title: 'Ingredients', 
                                        field: 'ingredients', 
                                        width: isMobile ? '60%' : '75%',
                                        render: (rowData) => this.renderIngredientChips(rowData, db),
                                        cellStyle: {
                                            padding: isMobile ? '8px 4px' : '16px 8px'
                                        }
                                    },
                                ]}
                                data={tableData}
                                options={{
                                    searching: true,
                                    maxBodyHeight: isMobile ? 'calc(100vh - 230px)' : '80vh',
                                    paging: false,
                                    actionsColumnIndex: -1,
                                    headerStyle: {
                                        backgroundColor: '#f5f5f5',
                                        color: textColor,
                                        fontWeight: 'bold',
                                        fontSize: isMobile ? '14px' : '16px',
                                        padding: isMobile ? '8px 4px' : '16px 8px'
                                    },
                                    rowStyle: {
                                        color: textColor
                                    },
                                    searchFieldStyle: {
                                        color: textColor
                                    },
                                    actionsCellStyle: {
                                        padding: isMobile ? '4px' : '8px'
                                    }
                                }}
                                icons={{
                                    Search: SearchIcon,
                                    ResetSearch: ClearIcon
                                }}
                                actions={[
                                    {
                                        icon: () => <Edit sx={{ 
                                            color: textColor,
                                            fontSize: isMobile ? 18 : 24
                                        }}/>,
                                        tooltip: 'Edit',
                                        onClick: (event, rowData) => this.handleEditMeal(rowData)
                                    },
                                    {
                                        icon: () => <Delete sx={{ 
                                            color: textColor,
                                            fontSize: isMobile ? 18 : 24
                                        }}/>,
                                        tooltip: 'Delete',
                                        onClick: (event, rowData) => this.openDeleteConfirmation(rowData)
                                    }
                                ]}
                                localization={{
                                    header: {
                                        actions: isMobile ? '' : 'Actions'
                                    }
                                }}
                            />
                        </ThemeProvider>
                    </Box>
                </Container>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteConfirmOpen}
                    onClose={this.closeDeleteConfirmation}
                    PaperProps={{
                        sx: { 
                            borderRadius: '8px',
                            width: isMobile ? '90%' : '400px'
                        }
                    }}
                >
                    <DialogTitle sx={{ 
                        color: textColor, 
                        fontSize: isMobile ? '18px' : '20px',
                        pt: 3
                    }}>
                        Confirm Delete
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1">
                            Are you sure you want to delete{' '}
                            <span style={{ fontWeight: 'bold' }}>
                                {mealToDelete?.mealTitle}
                            </span>?
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, color: textColor }}>
                            This action cannot be undone. The meal and its ingredients will be removed from your meal planner.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button 
                            onClick={this.closeDeleteConfirmation}
                            sx={{ color: 'text.secondary' }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={this.handleDeleteMeal}
                            variant="contained" 
                            color="error"
                            sx={{ 
                                minWidth: '80px',
                                bgcolor: '#d32f2f',
                                '&:hover': {
                                    bgcolor: '#b71c1c'
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {this.state.mealModal &&
                    <Dialog
                        open={this.state.mealModal}
                        onClose={() => this.handleModalClose('mealModal')}
                        maxWidth={false}
                        fullScreen={isMobile}
                    >
                        <MealModal
                            db={db}
                            closeCallback={() => this.handleModalClose('mealModal')}
                            confirmCallback={this.handleWriteMealData}
                            mealId={this.state.mealId}
                            mealTitle={this.state.mealTitle}
                            ingredients={this.state.ingredients}
                            isMobile={isMobile}
                        />
                    </Dialog>}
            </Box>
        );
    }
}

export default MealPageWrapper;
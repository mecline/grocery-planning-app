import { Button, Card, Dialog, IconButton, Typography, Box, useMediaQuery, useTheme, Chip } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import React from 'react';
import IngredientModal from './IngredientModal';
import IngredientChips from './IngredientChips';
import { auth, firebaseDb } from '../firebase/firebase.js';
import { StyledAddBox, StyledSquareButton, textColor, backgroundColor } from '../theme/MealPlannerTheme';

const MealModal = (props) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const [state, setState] = React.useState({
        user: auth.currentUser,
        mealTitle: props.mealTitle ? props.mealTitle : '',
        ingredients: props.ingredients ? props.ingredients : [],
        quantity: '',
        category: '',
        ingredientModal: false,
        isEditing: false,
    });

    const setMealTitle = (mealTitle) => {
        setState(prevState => ({ ...prevState, mealTitle }));
    };

    const setIngredients = (rowData) => {
        let filteredData = [];
        rowData.map((item) => {
            return filteredData.push({
                ingredientId: item.ingredientId,
                ingredientName: item.ingredientName,
                category: item.category,
                quantity: item.quantity ? item.quantity : 1,
                notes: item.notes
            });
        });
        setState(prevState => ({ ...prevState, ingredients: filteredData }));
    };

    const addIngredient = () => {
        setState(prevState => ({ ...prevState, ingredientModal: true, isEditing: true }));
    };

    const handleDeleteIngredient = (rowData) => {
        let snapshotList = [];
        firebaseDb.database().ref(`users/${state.user.uid}/ingredients/${rowData.ingredientId}`).remove();

        firebaseDb.database().ref(`users/${state.user.uid}/meals`).on('child_added', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                snapshotList.push(childSnapshot.val())
                if (Array.isArray(childSnapshot.val())) {
                    if (ingredientDeleteCheck(rowData.ingredientId, childSnapshot.val())) {
                        handleDeleteIngredientFromMeal(rowData.ingredientId, childSnapshot.val(), snapshot.key)
                    }
                }
            });
        });
    };

    const ingredientDeleteCheck = (id, ingredientList) => {
        let checkUpdate = false;
        ingredientList.forEach((item) => {
            if (item.ingredientId === id) {
                checkUpdate = true;
            }
        });
        return checkUpdate;
    };

    const handleDeleteIngredientFromMeal = (ingredientId, fullList, mealId) => {
        // handles deleting ingredients that have been attached to meals already
        let updatedIngredientList = fullList.filter(item => item.ingredientId !== ingredientId);

        // using .set as .update is deprecated for arrays being passed
        firebaseDb.database().ref(`users/${state.user.uid}/meals/${mealId}/ingredients`).set(
            updatedIngredientList
        );
    };

    const handleModalClose = (modalForClose) => {
        setState(prevState => ({
            ...prevState,
            [modalForClose]: false,
            isEditing: false,
            ingredientId: '',
            ingredientName: '',
            category: '',
            notes: ''
        }));
    };

    const handleWriteIngredientData = (ingredientName, category, notes, ingredientId, multipleAdditions) => {
        if (!ingredientId) {
            props.db.ref(`users/${state.user.uid}/ingredients`).push({
                ingredientName: ingredientName,
                category: category ? category : '',
                notes: notes
            });
        }
        else if (ingredientId) {
            props.db.ref(`users/${state.user.uid}/ingredients/${ingredientId}`).update({
                ingredientName: ingredientName,
                category: category ? category : '',
                notes: notes
            });
        }

        !multipleAdditions && setState(prevState => ({ ...prevState, ingredientModal: false }));
    };

    const handleIngredientsChange = (updatedIngredients) => {
        setState(prevState => ({ ...prevState, ingredients: updatedIngredients }));
    };

    const { db } = props;
    const { ingredients, mealTitle, ingredientModal } = state;
    let ingredientsDbRef = db.ref(`users/${state.user.uid}/ingredients`);
    let tableData = [];
    let ingredientStateIds = ingredients.map((item) => { return item.ingredientName });
    const quantityMap = new Map();

    ingredients.map((item) => {
        return quantityMap.set(item.ingredientName, item.quantity);
    });

    ingredientsDbRef.on('child_added', function (snapshot) {
        tableData.push({
            ingredientId: snapshot.key,
            ingredientName: snapshot.val().ingredientName,
            category: snapshot.val().category,
            quantity: (ingredientStateIds.includes(snapshot.val().ingredientName)) ? quantityMap.get(snapshot.val().ingredientName) : '',
            notes: snapshot.val().notes,
            tableData: ingredientStateIds.includes(snapshot.val().ingredientName) ? { checked: true } : { checked: false }
        });
    });

    return (
        <Box sx={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: isMobile ? 1 : 2
        }}>
            <Card sx={{ 
                p: isMobile ? 2 : 3, 
                width: isMobile ? '100vw' : '80vw', 
                height: isMobile ? '100vh' : '85vh',
                maxWidth: '1000px',
                maxHeight: isMobile ? '100vh' : '85vh', 
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: isMobile ? 0 : '8px',
                position: 'relative'
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row', 
                    alignItems: 'flex-start', 
                    mb: 2,
                    width: '100%'
                }}>
                    <Box sx={{ width: isMobile ? '100%' : '70%' }}>
                        <Typography 
                            variant={isMobile ? "h6" : "h5"} 
                            sx={{ 
                                color: textColor,
                                fontWeight: 'medium',
                                mb: 2
                            }}
                        >
                            {props.mealId ? 'Edit Meal' : 'Add New Meal'}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    fontWeight: 'medium',
                                    mb: 0.5
                                }}
                            >
                                Meal Title*
                            </Typography>
                            <input
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: isMobile ? '14px' : '16px'
                                }}
                                type="text"
                                value={mealTitle}
                                onChange={(e) => setMealTitle(e.target.value)}
                                placeholder="Enter meal name"
                                required
                            />
                        </Box>
                    </Box>
                    
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        ml: isMobile ? 0 : 'auto',
                        mt: isMobile ? 1 : 0,
                        mb: isMobile ? 2 : 0
                    }}>
                        <IconButton onClick={() => addIngredient()} size={isMobile ? "medium" : "large"}>
                            <StyledAddBox />
                        </IconButton>
                        <Typography variant={isMobile ? "body2" : "body1"}>Add Ingredient</Typography>
                    </Box>
                </Box>
                
                <Typography 
                    variant="subtitle1" 
                    sx={{ 
                        mb: 1,
                        color: textColor,
                        fontWeight: 'medium'
                    }}
                >
                    Selected Ingredients:
                </Typography>
                
                <Box sx={{ 
                    flex: 1,
                    overflowY: 'auto',
                    mb: 2,
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    p: 1
                }}>
                    {ingredients.length > 0 ? (
                        <Box sx={{ 
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            p: 1
                        }}>
                            {ingredients.map((item, index) => (
                                <Chip
                                    key={`${item.ingredientId}-${index}`}
                                    label={
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            maxWidth: isMobile ? '180px' : '200px',
                                        }}>
                                            {item.quantity > 1 && (
                                                <Typography 
                                                    component="span" 
                                                    sx={{ 
                                                        fontSize: isMobile ? '12px' : '14px',
                                                        mr: 0.5
                                                    }}
                                                >
                                                    ({item.quantity})
                                                </Typography>
                                            )}
                                            <Typography 
                                                component="span" 
                                                sx={{ 
                                                    fontSize: isMobile ? '12px' : '14px',
                                                    maxWidth: '100%',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                                title={item.notes ? `${item.ingredientName} - Note: ${item.notes}` : item.ingredientName}
                                            >
                                                {item.ingredientName}
                                            </Typography>
                                        </Box>
                                    }
                                    onDelete={() => {
                                        const updatedIngredients = ingredients.filter((_, i) => i !== index);
                                        handleIngredientsChange(updatedIngredients);
                                    }}
                                    sx={{
                                        backgroundColor: backgroundColor,
                                        color: textColor,
                                        m: 0.5,
                                        height: 'auto',
                                        padding: '2px',
                                        width: 'fit-content',
                                        paddingLeft: '10px',
                                        marginRight: '10px',
                                        '& .MuiChip-label': { 
                                            p: isMobile ? '4px 0' : '6px 0',
                                            overflow: 'visible' 
                                        },
                                        '& .MuiChip-deleteIcon': {
                                            color: textColor,
                                            fontSize: isMobile ? '16px' : '18px'
                                        }
                                    }}
                                    size={isMobile ? "small" : "medium"}
                                />
                            ))}
                        </Box>
                    ) : (
                        <Typography 
                            sx={{ 
                                color: '#777', 
                                fontStyle: 'italic', 
                                textAlign: 'center',
                                p: 2
                            }}
                        >
                            No ingredients selected. Click "Add Ingredient" to add ingredients to your meal.
                        </Typography>
                    )}
                </Box>
                
                <Typography 
                    variant="subtitle1" 
                    sx={{ 
                        mb: 1,
                        color: textColor,
                        fontWeight: 'medium'
                    }}
                >
                    Available Ingredients:
                </Typography>
                
                <Box sx={{ 
                    flex: 2,
                    overflowY: 'auto',
                    mb: 2,
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    p: 1
                }}>
                    <IngredientChips
                        ingredients={tableData}
                        selectedIngredients={ingredients}
                        onIngredientsChange={handleIngredientsChange}
                    />
                </Box>

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    borderTop: '1px solid #eee',
                    pt: 2,
                    mt: 'auto'
                }}>
                    <Button 
                        variant="outlined"
                        sx={{ 
                            mr: 1,
                            minWidth: '80px',
                            color: '#666',
                            borderColor: '#ccc'
                        }} 
                        onClick={() => props.closeCallback()}
                        size={isMobile ? "small" : "medium"}
                    >
                        Cancel
                    </Button>
                    <StyledSquareButton
                        sx={{ 
                            minWidth: isMobile ? '80px' : '100px'
                        }}
                        onClick={() => props.confirmCallback(state.mealTitle, state.ingredients, props.mealId)}
                        size={isMobile ? "small" : "medium"}
                        disabled={!mealTitle.trim()}
                    >
                        Save
                    </StyledSquareButton>
                </Box>
            </Card>

            {ingredientModal &&
                <Dialog
                    fullScreen={isMobile}
                    open={ingredientModal}
                    maxWidth="md"
                    onClose={() => handleModalClose('ingredientModal')}
                >
                    <IngredientModal
                        db={db}
                        closeCallback={() => handleModalClose('ingredientModal')}
                        confirmCallback={handleWriteIngredientData}
                        ingredientId={state.ingredientId}
                        ingredientName={state.ingredientName}
                        category={state.category}
                        notes={state.notes}
                        isMobile={isMobile}
                    />
                </Dialog>
            }
        </Box>
    );
};

export default MealModal;
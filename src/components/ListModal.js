import SearchIcon from '@mui/icons-material/Search';
import {
    Box,
    Button,
    Chip,
    Divider,
    InputAdornment,
    Paper,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import React from 'react';
import { auth } from '../firebase/firebase.js';
import { StyledSquareButton, backgroundColor, textColor } from '../theme/MealPlannerTheme';

const ListModal = (props) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const [state, setState] = React.useState({
        user: auth.currentUser,
        searchTerm: '',
        selectedMeals: props.selectedMeals ? [...props.selectedMeals] : []
    });

    const handleSearch = (event) => {
        setState({ ...state, searchTerm: event.target.value.toLowerCase() });
    };

    const handleChipClick = (meal) => {
        const mealId = meal.mealId;
        let newSelectedMeals = [...state.selectedMeals];
        
        if (newSelectedMeals.includes(mealId)) {
            return;
        } else {
            newSelectedMeals.push(mealId);
        }

        setState({ ...state, selectedMeals: newSelectedMeals });
    };

    const handleChipDelete = (mealId) => {
        let newSelectedMeals = state.selectedMeals.filter(id => id !== mealId);
        setState({ ...state, selectedMeals: newSelectedMeals });
    };

    const { db } = props;
    const { searchTerm, selectedMeals } = state;

    // Get all meals from database
    let mealsDbRef = db.ref(`users/${state.user.uid}/meals`);
    let allMeals = [];

    mealsDbRef.on('child_added', function(snapshot) {
        allMeals.push({
            mealId: snapshot.key,
            mealTitle: snapshot.val().mealTitle,
            ingredients: snapshot.val().ingredients
        });
    });

    // Filter meals based on search term
    const filteredMeals = allMeals.filter(meal => 
        meal.mealTitle.toLowerCase().includes(searchTerm)
    );

    // Create a lookup for meal titles by ID
    const mealTitlesById = {};
    allMeals.forEach(meal => {
        mealTitlesById[meal.mealId] = meal.mealTitle;
    });

    return (
        <Box sx={{ 
            width: isMobile ? '95vw' : '600px', 
            maxWidth: '100%',
            p: isMobile ? 2 : 4, 
            display: 'flex', 
            flexDirection: 'column',
            maxHeight: isMobile ? '90vh' : '85vh',
            overflow: 'auto'
        }}>
            <Typography 
                variant={isMobile ? "h6" : "h5"} 
                sx={{ 
                    mb: isMobile ? 2 : 3, 
                    color: textColor,
                    fontWeight: 'bold' 
                }}
            >
                Select Meals for Shopping List
            </Typography>
            
            <Box sx={{ mb: isMobile ? 2 : 3 }}>
                <Paper 
                    elevation={1} 
                    sx={{ 
                        p: isMobile ? 1.5 : 2, 
                        minHeight: '50px',
                        backgroundColor: '#f9f9f9', 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 0.5 
                    }}
                >
                    {selectedMeals.length > 0 ? (
                        // Display selected meals
                        [...new Set(selectedMeals)].map(mealId => (
                            mealTitlesById[mealId] && (
                                <Chip
                                    key={mealId}
                                    label={mealTitlesById[mealId]}
                                    onDelete={() => handleChipDelete(mealId)}
                                    size={isMobile ? "small" : "medium"}
                                    sx={{
                                        backgroundColor: backgroundColor,
                                        color: textColor,
                                        m: 0.5,
                                        '& .MuiChip-deleteIcon': {
                                            color: textColor
                                        }
                                    }}
                                />
                            )
                        ))
                    ) : (
                        <Typography 
                            variant={isMobile ? "body2" : "body1"}
                            sx={{ 
                                color: 'text.secondary', 
                                fontStyle: 'italic',
                                p: 1
                            }}
                        >
                            No meals selected. Click on a meal below to add it to your list.
                        </Typography>
                    )}
                </Paper>
            </Box>

            <Divider sx={{ mb: isMobile ? 1.5 : 2 }} />
            
            <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center', 
                justifyContent: 'space-between', 
                mb: isMobile ? 1.5 : 2,
                gap: isMobile ? 1 : 0
            }}>
                <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    sx={{ 
                        color: textColor,
                        fontWeight: 'medium'
                    }}
                >
                    Available Meals:
                </Typography>
                
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search meals..."
                    value={searchTerm}
                    onChange={handleSearch}
                    sx={{ 
                        width: isMobile ? '100%' : '250px'
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
            
            <Box 
                sx={{ 
                    height: isMobile ? '200px' : '300px', 
                    maxHeight: isMobile ? '40vh' : '50vh',
                    overflowY: 'auto', 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 0.5,
                    p: isMobile ? 1 : 1.5,
                    mb: isMobile ? 2 : 3,
                    border: '1px solid #eee',
                    borderRadius: '4px'
                }}
            >
                {filteredMeals.length > 0 ? (
                    filteredMeals.map(meal => {
                        const isSelected = selectedMeals.includes(meal.mealId);
                        return (
                            <Chip
                                key={meal.mealId}
                                label={meal.mealTitle}
                                onClick={() => handleChipClick(meal)}
                                size={isMobile ? "small" : "medium"}
                                sx={{
                                    backgroundColor: isSelected ? backgroundColor : '#f1f1f1',
                                    color: isSelected ? textColor : 'rgba(0, 0, 0, 0.87)',
                                    m: 0.5,
                                    '&:hover': {
                                        backgroundColor: isSelected ? backgroundColor : '#e0e0e0',
                                    }
                                }}
                            />
                        );
                    })
                ) : (
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'text.secondary', 
                            fontStyle: 'italic', 
                            p: 1,
                            width: '100%',
                            textAlign: 'center'
                        }}
                    >
                        No meals found matching "{searchTerm}".
                    </Typography>
                )}
            </Box>

            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                mt: 'auto',
                pt: isMobile ? 1 : 2,
                borderTop: '1px solid #eee'
            }}>
                <Button 
                    onClick={() => props.closeCallback()} 
                    sx={{ mr: 1 }}
                    size={isMobile ? "small" : "medium"}
                >
                    Cancel
                </Button>
                <StyledSquareButton
                    onClick={() => props.confirmCallback(selectedMeals)}
                    size={isMobile ? "small" : "medium"}
                >
                    Save
                </StyledSquareButton>
            </Box>
        </Box>
    );
};

export default ListModal;
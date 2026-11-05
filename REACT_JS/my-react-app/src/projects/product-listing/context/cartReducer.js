export const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD': {
            const existing = state.find(item => item.id === action.payload.id);
            if (existing) {
                return state.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...state, { ...action.payload, quantity: 1 }];
        }
        case 'INCREMENT':
            return state.map(item =>
                item.id === action.payload
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );

        case 'DECREMENT':
            return state.map(item => 
                item.id === action.payload
                ? {...item, quantity: item.quantity - 1}
                : item
            )
            .filter(item => item.quantity > 0);

        case 'REMOVE':
            return state.filter(item => item.id !== action.payload);
        
        case 'CLEAR':
            return [];
        
        default:
            return state;
    }
}
const LoadMoreDataBtn = ({ state, fetchDataFunc }) => {
    if (state !== null && state.totalDocs > state.results.length) {
        return (
            <div className="text-center mb-1">
                <button
                    className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md gap-2 hover:shadow-sm"
                    onClick={() => fetchDataFunc({ page: state.page + 1 })}
                >
                    Load More
                </button>
            </div>
        );
    }
};

export default LoadMoreDataBtn;
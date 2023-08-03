const Button = (props) => {
  return (
    <button
      className="bg-black text-white px-4 py-3 enabled:hover:bg-gray-900 hover:shadow-md enabled:active:scale-[0.97] active:shadow-sm active:bg-black disabled:opacity-50 disabled:shadow-none font-surreal rounded-full"
      {...props}
    >
      {props.children}
    </button>
  );
};

export default Button;

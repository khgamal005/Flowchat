import React, { FC, useState, useEffect, useCallback, useRef } from 'react';

// --- MOCK LIBRARY IMPLEMENTATIONS ---

// 1. Mock UI Components (Simplified Shadcn/Tailwind look)
const Card = ({ children }) => <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">{children}</div>;
const CardContent = ({ children, className = '' }) => <div className={`p-0 ${className}`}>{children}</div>;
const Input = React.forwardRef(({ className = '', type, accept, ...props }, ref) => (
    <input
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        type={type}
        accept={accept}
        ref={ref}
        {...props}
    />
));
const Button = ({ children, onClick, disabled, size = 'md', className = '', type = 'button' }) => {
    const sizeClasses = size === 'lg' ? 'h-11 px-8' : 'h-9 px-4';
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 ${sizeClasses} ${className}`}
        >
            {disabled ? 'Uploading...' : children}
        </button>
    );
};

// 2. Mock Form Components (Structure for React Hook Form)
const Form = ({ children, ...props }) => <form {...props}>{children}</form>;
// FIX: Updated FormField mock to correctly pass { field, formState } to the render function.
const FormField = ({ render, control, name, ...props }) => {
    // In this mock environment, we rely on control.getValues() to retrieve the entire form object,
    // which includes the mocked 'field' and 'formState' properties, created in useForm.
    const form = control.getValues();
    
    // Extract the mock field object which holds name, onChange, onBlur, and ref
    const field = form.field; 
    
    // Fallback/Error Check for the mock environment
    if (!field) {
        console.error('Mock FormField error: Field is undefined. Check useForm mock structure.');
        return null;
    }

    // RHF's FormField/Controller provides the { field, formState } structure to render.
    return render({ field: field, formState: form.formState });
};
const FormItem = ({ children }) => <div className="space-y-2">{children}</div>;
const FormLabel = ({ children, htmlFor }) => <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">{children}</label>;
const FormControl = ({ children }) => children;
const FormMessage = ({ children }) => <p className="text-sm font-medium text-red-500 min-h-[1.25rem]">{children}</p>; // Added min-height to prevent CLS

// 3. Mock External Libraries
const z = {
    object: (schema) => schema,
    instanceof: (type) => ({
        refine: (fn, msg) => ({ refine: (fn2, msg2) => ({ _parse: true, _type: 'zod', fn, msg, fn2, msg2 }) })
    }),
};
const zodResolver = (schema) => (values) => {
    const fileList = values.file;
    const file = fileList?.[0];

    // Simple mock validation logic
    if (!fileList || fileList.length === 0) {
        return { values: {}, errors: { file: { message: 'File is required' } } };
    }
    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
        return { values: {}, errors: { file: { message: 'File must be an image or a PDF' } } };
    }
    return { values, errors: {} };
};

// Mock the core functions from 'react-hook-form' for runnability
const useForm = (config) => {
    const [values, setValues] = useState(config.defaultValues || {});
    const [errors, setErrors] = useState({});

    // Mock register: provides necessary props (name, ref, onBlur)
    const register = (name) => ({
        name,
        onBlur: () => {},
        ref: useRef(null)
    });

    const triggerValidation = useCallback((values) => {
        if (config.resolver) {
            const { errors: resolvedErrors } = config.resolver(values);
            setErrors(resolvedErrors || {});
            return Object.keys(resolvedErrors || {}).length === 0;
        }
        return true;
    }, [config.resolver]);

    const form = {
        control: {
            // Mock control logic for FormField
            getValues: () => ({ ...form, field: mockField, formState: form.formState }), // FIX: Ensure control.getValues() returns the full object
        },
        handleSubmit: (onSubmit) => async (e) => {
            e.preventDefault();
            const isValid = await triggerValidation(values);

            if (isValid) {
                await onSubmit(values);
            } else {
                console.error('Form validation failed:', errors);
            }
        },
        register,
        formState: { errors },
        setValue: (name, value) => setValues(prev => ({ ...prev, [name]: value })),
        getValues: (name) => name ? values[name] : values,
        watch: () => values,
        reset: () => setValues(config.defaultValues || {}),
        trigger: () => triggerValidation(values),
    };

    // Mock field object passed to FormField's render prop
    const mockField = {
        name: 'file',
        value: values.file,
        onChange: (fileList) => form.setValue('file', fileList),
        onBlur: () => {},
        ref: register('file').ref,
    };

    // Return the form object, including the mock field for the FormField mock to use
    return { ...form, field: mockField };
};

// Mock other utilities
const uuid = () => 'mock-uuid-12345';
const toast = { success: (msg) => console.log('TOAST SUCCESS:', msg), error: (msg) => console.error('TOAST ERROR:', msg) };
const FileIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>;
const Typography = ({ text }) => <>{text}</>; // Simplified Typography
const createClient = () => ({
    storage: {
        from: (bucket) => ({
            upload: async (fileName, file) => {
                // Mock network delay and success
                await new Promise(resolve => setTimeout(resolve, 1500));
                if (file.name.includes('fail')) {
                    return { data: null, error: { message: 'Mock Upload Failure' } };
                }
                return { data: { path: `/storage/${fileName}` }, error: null };
            }
        })
    },
    from: (table) => ({
        insert: async (data) => {
            // Mock network delay and success
            await new Promise(resolve => setTimeout(resolve, 50));
            // Mock insertion failure check
            if (data.file_url.includes('fail')) {
                 return { data: null, error: { message: 'Mock DB Insert Failure' } };
            }
            return { data: [], error: null };
        }
    })
});

// --- MOCK TYPES ---
// Since this is a single file, we define simplified types locally
/** @typedef {{ id: string, email: string, name: string }} User */
/** @typedef {{ id: string, name: string }} Workspace */
/** @typedef {{ id: string, name: string }} Channel */

// --- ZOD SCHEMA ---
const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine(files => files?.length === 1, 'File is required')
    .refine(files => {
      const file = files?.[0];
      return (
        file?.type === 'application/pdf' || file?.type.startsWith('image/')
      );
    }, 'File must be an image or a PDF or includes "fail" in the filename'), // Adjusted message for mock failure test
});

/**
 * @param {object} props
 * @param {User} props.userData
 * @param {Workspace} props.workspaceData
 * @param {Channel | undefined} props.channel
 * @param {string | undefined} props.recipientId
 * @param {() => void} props.toggleFileUploadModal
 */
const ChatFileUpload = ({
  channel,
  userData,
  workspaceData,
  recipientId,
  toggleFileUploadModal,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  /**
   * @param {z.infer<typeof formSchema>} values
   */
  async function handleUpload(values) {
    console.log('--- Submitting Values ---', values);
    setIsUploading(true);
    const uniqueId = uuid();
    const file = values.file?.[0];

    if (!file) {
        setIsUploading(false);
        toast.error('File object missing after form submission.');
        return;
    }

    const supabase = createClient();

    let fileTypePrefix = '';
    if (file.type === 'application/pdf') {
      fileTypePrefix = 'pdf';
    } else if (file.type.startsWith('image/')) {
      fileTypePrefix = 'img';
    }

    const fileName = `chat/${fileTypePrefix}-${uniqueId}`;

    // 1. File Upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chat-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast.error(`Upload Failed: ${uploadError.message}`);
      setIsUploading(false);
      return;
    }
    console.log('File uploaded successfully to path:', uploadData.path);

    // 2. Message Insertion
    let messageInsertError = null;

    if (recipientId) {
      const { error: dmError } = await supabase
        .from('direct_messages')
        .insert({
          file_url: uploadData.path,
          user: userData.id,
          user_one: userData.id,
          user_two: recipientId,
        });

      messageInsertError = dmError;
    } else {
      const { error: cmError } = await supabase
        .from('messages')
        .insert({
          file_url: uploadData.path,
          user_id: userData.id,
          channel_id: channel?.id,
          workspace_id: workspaceData.id,
        });

      messageInsertError = cmError;
    }

    if (messageInsertError) {
      console.error('Error inserting message:', messageInsertError);
      toast.error(`Message Insert Failed: ${messageInsertError.message}`);
      // NOTE: In a real app, you might want to delete the uploaded file here.
    } else {
        toast.success('File and message uploaded successfully!');
        form.reset();
        toggleFileUploadModal();
    }


    setIsUploading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-[Inter]">
        <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Chat File Uploader</h2>
            <Card>
            <CardContent className='p-6 space-y-4'>
                <div className='border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg flex flex-col gap-2 p-6 items-center'>
                <FileIcon className='w-12 h-12 text-blue-500' />
                <span className='text-sm font-medium text-gray-500'>
                    <Typography text='Select an Image or PDF' />
                </span>
                </div>

                <div className='space-y-2 text-sm'>
                <Form onSubmit={form.handleSubmit(handleUpload)} className='space-y-6'>
                    <FormField
                        control={form.control}
                        name='file'
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel htmlFor='file'>
                                Select File
                            </FormLabel>
                            <FormControl>
                                <Input
                                type='file'
                                id='file'
                                accept='image/*,application/pdf'
                                // --- THIS RELIES ON THE CORRECTED FormField MOCK ---
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                                onChange={event => {
                                    // Manually call RHF's onChange with the FileList
                                    field.onChange(event.target.files);
                                }}
                                placeholder='Choose a file'
                                />
                            </FormControl>
                            <FormMessage>
                                {form.formState.errors.file?.message}
                            </FormMessage>
                            </FormItem>
                        )}
                    />

                    <Button type='submit' disabled={isUploading} size='lg' className="w-full">
                        <Typography text='Upload File' />
                    </Button>
                </Form>
                </div>
            </CardContent>
            </Card>
            <p className="mt-4 text-xs text-gray-500 text-center">
                User: {userData.name} ({userData.id}) | Target: {recipientId ? `DM to ${recipientId}` : `Channel ${channel?.name}`}
            </p>
            <p className="mt-2 text-xs text-gray-500 text-center">
                **Note:** Try uploading a file named 'fail.jpg' to mock an upload error.
            </p>
        </div>
    </div>
  );
};
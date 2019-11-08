import {GetFormHandler} from './get-form-handler';
import {ApiService} from '../../api';
import {FileService} from '../../util/file/def/file-service';
import {CachedItemRequestSourceFrom, CachedItemStore} from '../../key-value-store';
import {mockSdkConfigWithFormServiceConfig} from '../impl/form-service-impl.spec.data';
import {FormRequest, FormServiceConfig} from '..';
import {Observable} from 'rxjs';

describe('GetFormHandler', () => {
    let getFormHandler: GetFormHandler;

    const mockApiService: Partial<ApiService> = {};
    const mockFileService: Partial<FileService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};

    beforeAll(() => {
        getFormHandler = new GetFormHandler(
            mockApiService as ApiService,
            mockSdkConfigWithFormServiceConfig as FormServiceConfig,
            mockFileService as FileService,
            mockCachedItemStore as CachedItemStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of getFormHandler', () => {
        expect(getFormHandler).toBeTruthy();
    });

    it('should handle cachedItem when called with API', async (done) => {
        // arrange
        const request: FormRequest = {
            type: 'sample_type',
            subType: 'sample_subType',
            action: 'sample_action',
            rootOrgId: 'sample_rootOrgId',
            frameWork: 'sample_framework'
        };
        mockCachedItemStore.getCached = jest.fn((a, b, c, d, e) => d());
        mockApiService.fetch = jest.fn(() => Observable.of({
            body: {
                result: 'sample_result'
            }
        }));
        // act
        getFormHandler.handle(request).subscribe(() => {
            // assert
            expect(mockCachedItemStore.getCached).toHaveBeenCalled();
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
    });

    it('should handle cachedItem when called with fileService', () => {
        // arrange
        const request: FormRequest = {
            type: 'sample_type',
            subType: 'sample_subType',
            action: 'sample_action',
            rootOrgId: 'sample_rootOrgId',
            frameWork: 'sample_framework'
        };
        mockCachedItemStore.getCached = jest.fn((a, b, c, d, e) => e());
        mockFileService.readFileFromAssets = jest.fn((result) => Observable.of({
            result: result.form
        }));
        // act
        getFormHandler.handle(request).subscribe(() => {
            // assert
            expect(mockCachedItemStore.getCached).toHaveBeenCalled();
            expect(mockFileService.readFileFromAssets).toHaveBeenCalled();
        });
    });

    it('should handle cachedItem from server if not available', async (done) => {
        // arrange
        const request: FormRequest = {
            from: CachedItemRequestSourceFrom.SERVER,
            type: 'sample_type',
            subType: 'sample_subType',
            action: 'sample_action',
            rootOrgId: 'sample_rootOrgId',
            frameWork: 'sample_framework'
        };

        mockApiService.fetch = jest.fn(() => Observable.of({
            body: {
                result: 'sample'
            }
        }));
        // act
        getFormHandler.handle(request).subscribe(() => {
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
    });
});
